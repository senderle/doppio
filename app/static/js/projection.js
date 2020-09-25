document.addEventListener('DOMContentLoaded', function main() {

    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////
    // Schema
    //

    var req = new XMLHttpRequest();
    req.open("GET", "/schema.json", false);
    req.send();
    var rootRecord = JSON.parse(req.responseText);

    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////
    // Rendering DOM elements
    //

    function isLeaf(obj) {
        leafTypes = ['string', 'number', 'integer', 'boolean', 'datetime'];
        return leafTypes.includes(obj.type);
    }

    function wrapWith(tagname, el, attribs) {
        var tag = document.createElement(tagname);
        for (var key in attribs) {
            tag.setAttribute(key, attribs[key]);
        }
        tag.appendChild(el);
        return tag;
    }

    function focusRendered() {
        var rendered = document.querySelectorAll('.newly-rendered');

        for (var i = 0; i < rendered.length; i++) {
            var node = rendered[i];
            if (i === 0) {
                node.focus();
            }
            node.classList.remove('newly-rendered');
        }
    }

    function focusTop() {
        focusRendered();

        var inputs = document.querySelectorAll('.main-form-input');
        if (inputs.length > 0) {
            inputs[0].focus();
        }
    }

    // Currently, leaves are always placed after higher-level
    // containers unless a specific order is given. However, that
    // doesn't work for some projects. We need to update this.
    function formKeySortCmp(formSpec) {
        return function(a, b) {
            if (formSpec[a].hasOwnProperty('order') &&
                formSpec[b].hasOwnProperty('order')) {
                var ao = formSpec[a].order;
                var bo = formSpec[b].order;
                return ao < bo ? -1 : ao == bo ? 0 : 1;
            } else if (isLeaf(formSpec[a])) {
                if (!isLeaf(formSpec[b])) {
                    return -1;
                }
            } else {
                if (isLeaf(formSpec[b])) {
                    return 1;
                }
            }
            return a < b ? -1 : a == b ? 0 : 1;
        }
    }

    // This renders all leaf-level input fields.
    function renderInput(root, schema, id, label) {

        // Render the label
        var labelEl = document.createElement('label');
        var labelText = document.createTextNode(label);
        labelEl.appendChild(labelText);
        labelEl.setAttribute('for', id);
        labelEl = wrapWith('div', labelEl, {
            'class': 'form-leaf-label'
        });

        // Render the input field itself. Most fields can be
        // rendered based on the `schema.formType` field, but
        // We have to special-case textareas and select fields.
        var inputEl = document.createElement('INPUT');
        inputEl.setAttribute('type', 'checkbox');

        inputEl.setAttribute('id', id);
        inputEl.setAttribute('class', 'main-form-input newly-rendered');

        var container = document.createElement('div');
        container.classList.add('form-leaf');
        container.appendChild(labelEl);
        container.appendChild(inputEl);
        root.appendChild(container);
        return container;
    }

    function renderHeader(root, text, schema) {
        var headerText = document.createTextNode(text);
        var header = document.createElement('h3');

        for (var attribKey in schema) {
            header.setAttribute(attribKey, schema[attribKey]);
        }
        header.appendChild(headerText);
        root.appendChild(header);
        return header;
    }

    function renderSubRoot(root, id, attribs) {
        // In order to extract data back out of the form, and to provide
        // classes for styling, we sometimes need to create a unique
        // root element with an id that will be the prefix of all the
        // elements it contains.
        var subRoot = document.createElement('div');

        for (var attribKey in attribs) {
            subRoot.setAttribute(attribKey, attribs[attribKey]);
        }

        // Create container and append checkbox and label if needed
        if (id && document.getElementById(id)) {
            // This case corresponds to fields that have already
            // been given a checkbox by a previous invocation of the
            // list renderer, so we don't add one here. This happens
            // only for lists with complex values. (This comes from
            // invocations of renderDict that were specifically
            // initiated by a list renderFunc.)
            // console.log("Checkbox already exists: ", subRoot);
        } else if (!id) {
            // This case corresponds to those fields that are purely
            // visual groupings, having no significance for data labels,
            // so we don't add a checkbox here either. This comes from
            // the function that renders a single new list item (called
            // renderFunc above.)
            // console.log("Cosmetic grouping: ", subRoot);
        } else if (id && !document.getElementById(id)) {
            // In all other cases we need to render a checkbox.

            var labelEl = document.createElement('label');
            var labelText = document.createTextNode('Display All'); // idToProjectionName(id));
            labelEl.appendChild(labelText);
            labelEl.setAttribute('for', id);
            labelEl = wrapWith('div', labelEl, {
                'class': 'form-leaf-label'
            });

            // Render checkbox
            var inputEl = document.createElement('input');
            inputEl.setAttribute('type', 'checkbox');
            inputEl.setAttribute('id', id);
            inputEl.setAttribute('class', 'main-form-input newly-rendered');

            var container = document.createElement('div');
            container.classList.add('form-subroot');

            if (!attribs) {
                // If there are no attributes, then this is coming from an
                // invocation of renderDict that was *not* initiated by
                // a list renderFunc.
                // console.log("Bare form subroot: ", subRoot);

                // We apply a class to adjust styling in this case, because
                // otherwise, the alignment of checkboxes is thrown off.
                container.classList.add('form-subroot-bare');
            } else {
                // The only attribute ever applied to a subRoot is the
                // subform-group class, which is used to collect the records
                // from all lists. The checkbox created here is the one that
                // prevents creation of a checkbox in the "Checkbox already
                // exists" case above.
                // console.log("List form subroot: ", subRoot);
            }

            container.appendChild(labelEl);
            container.appendChild(inputEl);
            subRoot.appendChild(container);
        }

        root.appendChild(subRoot);
        return subRoot;
    }

    var subFormFactory = (function() {
        // A factory object that creates and keeps track of the callbacks
        // that render new copies of forms that can be repeated. For
        // example, if a scheme allows multiple `tree`s in a list, this
        // renders a new `tree` sub-form each time it is called, with
        // a key that reflects its order of creation. (tree_1, tree_2, etc.)

        // We will sometimes also want to refer to one of these
        // callbacks from outside the event to which it's bound, such as
        // when we are loading saved data. To make that possible, we also
        // include here a mapping of key values to renderers.

        var factory = {};
        factory.getRendererFromKey = {};
        factory.buildRenderer = function(root, subForm, idPrefix) {

            var renderSubForm = function(n) {
                // This closure maintains the renderFunc's state (`n`).
                // Concretely, `n` will always be one greater than the
                // number of sub-forms rendered so far.

                // If the sub-form a leaf, we want to terminate recursion.
                var recursiveRender;
                if (isLeaf(subForm)) {
                    // `renderInput` is non-recursive.
                    recursiveRender = renderInput;
                } else if (subForm.type == 'list') {
                    recursiveRender = renderList;
                    subForm = subForm.schema;
                    console.log('Lists of lists not yet tested!');
                } else if (subForm.type == 'dict') {
                    recursiveRender = renderDict;
                    subForm = subForm.schema;
                } else if (subForm.type === undefined) {
                    // If a list's schema is untyped, it should be possible
                    // to treat it as a dictionary for the purpose of rendering.
                    recursiveRender = renderDict;
                } else {
                    console.log(subForm);
                    throw "Unrecognized subForm type."
                }

                var itemName = singular(titleCase(idTail(idPrefix)));

                renderFunc = function() {
                    // This function renders the actual form, tracking
                    // and updating the value of `n` attached to its closure.
                    var newId = idPrefix;
                    var newHeader = itemName;
                    let subRoot = renderSubRoot(root);
                    recursiveRender(subRoot, subForm, newId, newHeader);
                    if (n > 1) {
                        focusRendered();
                    }

                    n += 1;
                    event.preventDefault();
                    return false;
                };

                factory.getRendererFromKey[idPrefix] = renderFunc;
                return renderFunc;
            };

            // Return a new sub-form renderer initialized at 1.
            return renderSubForm(1);
        };

        return factory;
    })();

    // This button calls sub-form renderers created by the above
    // factory. It's easiest to create the renderers and bind them
    // at the same time that we create the button, but if we don't
    // preserve a reference to the renderer, we can't automatically
    // render multiple subforms later (as we would like to if we are,
    // for example, loading saved data containing a list.)
    function renderNewItemButton(root, subForm, idPrefix) {
        var renderSubForm = subFormFactory.buildRenderer(
            root, subForm, idPrefix
        );

        var button = document.createElement('a');
        var itemName = singular(titleCase(idTail(idPrefix)));
        var text = document.createTextNode(
            '+ New ' + itemName
        );

        button.setAttribute('href', '#');
        button.setAttribute('class', 'button');
        button.appendChild(text);
        button.addEventListener('click', renderSubForm);

        // We populate the list with one empty sub-form.
        renderSubForm();

        return button;
    }

    function renderList(root, schema, id, label) {
        // The most complex case. We need to create a way to
        // automatically render new sub-forms in a list so that
        // users can add as many new items as they like.

        // First, render a separate header for the whole list.
        // (Individual items will have headers of their own.)
        renderHeader(root, label, {
            'class': 'subheader'
        });

        // Create a container to hold all the items along with
        // the button.

        subRoot = renderSubRoot(root,
            id, {
                'class': 'subform-group'
            });

        // The button itself. The form for the first item in the
        // list will be rendered by the button callback, which
        // itself *calls this function again recursively*. So this
        // is a form of deferred recursion, even though it doesn't
        // look that way.
        var button = renderNewItemButton(
            subRoot, schema, id
        );
        button = wrapWith(
            'div', button, {
                'class': 'subform-group ui-element'
            }
        );
        // root.appendChild(button);
    }

    // Render a dicitonary type. This also winds up being the root
    // rendering function, since the first level of a schema should generally
    // always be a dictionary. This calls itself recursively whenever
    // it sees an element of `schema` that is not a leaf.
    function renderDict(root, schema, id, label) {
        id = id ? id : '';
        if (schema.schema) {
            throw "render: formSpec has a schema key. This indicates a logical error.";
        }

        if (label) {
            renderHeader(root, label, {
                'class': 'instance-header'
            });
        }

        var subRoot = renderSubRoot(root, id);
        var keys = Object.keys(schema);
        keys.sort(formKeySortCmp(schema));

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (!schema.hasOwnProperty(key)) {
                continue;
            }

            var subForm = schema[key];
            var subHeader = key ? titleCase(key) : '';
            var nodeId = toId(key, id);
            if (isLeaf(subForm)) {
                // Terminate recursion.
                renderInput(subRoot, subForm, nodeId, subHeader);
            } else if (subForm.type == 'list') {
                // Defer recursion.
                renderList(subRoot, subForm.schema, nodeId, subHeader);
            } else if (subForm.type == 'dict') {
                // Continue recursion.
                renderDict(subRoot, subForm.schema, nodeId, subHeader);
            } else {
                throw "renderDict: subForm type unrecognized";
            }
        }
    }

    function resetForm() {
        var formRoot = document.getElementById('playbill-form');
        while (formRoot.lastChild) {
            formRoot.removeChild(formRoot.lastChild);
        }
        // renderSearch(formRoot, rootRecord, 'search');
        renderDict(formRoot, rootRecord);
        focusTop();
    }

    //////////////////// Reset form button //////////////////////////
    var reset = document.getElementById("clear-search");
    var statusAlert = document.getElementById('status-message-window');
    reset.addEventListener('click', function() {
        if (confirm("Are you sure you want to reset the form?")) {
            resetForm();
        } else {

        }
    });

    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////
    // Load/Save Records
    //

    // Helper to parse id to search
    function idToApiPath(s) {
        var split = idToList(s);
        split = split.filter(el => isNaN(parseInt(el)));
        var path = split.join(".");
        return path;
    }

    // Project Response
    var projectButton = document.getElementById('project-button');
    projectButton.addEventListener('click', function() {
        window.scrollTo(0,0);
        document.getElementById('search-results').innerHTML = ""; // Clear past search results
        var elements = document.querySelectorAll('.main-form-input');
        var urlPath = '{';

        var count = 0;

        for (var i = 0; i < elements.length; i++) {
            if (elements[i].checked) {

                path = idToApiPath(elements[i].id);
                urlPath = urlPath + '"' + path + '":1,';
                count++;
            }
        }
        urlPath = urlPath.substring(0, urlPath.length - 1);
        urlPath = urlPath + '}';


        let searchQueryPath = localStorage.getItem("searchQueryPath") +
                              '&projection=' + urlPath;
        fetch(searchQueryPath)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                let records = data['_items'];
                let nrecords = data._meta.total;

                // Create header to display results
                let header = document.createElement('h3');
                let txt = nrecords + " results found for your query:\n\n"
                let title = document.createTextNode(txt);
                header.appendChild(title);
                document.getElementById("search-results").appendChild(header);

                // Create map with records
                // renderProjectedMap(records);

                var recordPre = function(header, content) {
                    let p = document.createElement('pre');
                    p.style = 'word-break: break-all;';
                    let text = document.createTextNode('\n### ' + header + ' ###\n' + content);
                    p.appendChild(text);
                    return p;
                };

                // Loop over and display all found records
                records.forEach( (rec, rec_index) => {
                    // rec = JSON.stringify(rec);
                    let rec_meta = {}
                    let rec_main = {}
                    Object.keys(rec).forEach(k => {
                        if (k.startsWith('_')) {
                            rec_meta[k.slice(1)] = rec[k];
                        } else {
                            rec_main[k] = rec[k];
                        }
                    });
                    rec_meta['resultNumber'] = rec_index;

                    let resultOut = document.getElementById('search-results');
                    let rec_meta_text = jsyaml.safeDump(rec_meta, {'indent': 4});
                    let rec_meta_pre = recordPre('Record Metadata', rec_meta_text);
                    let a = document.createElement('a');
                    a.setAttribute('href', '/home#' + rec['_id']);
                    a.appendChild(document.createTextNode('(Load record in main form)'));
                    rec_meta_pre.appendChild(a);
                    resultOut.appendChild(rec_meta_pre);

                    let rec_main_text = jsyaml.safeDump(rec_main, {'indent': 4});
                    resultOut.appendChild(recordPre('Record', rec_main_text));

                    let div = document.createElement('hr');
                    resultOut.appendChild(div);
                });
            });
    });

    resetForm();

    if (window.location.hash.substr(1) !== '') {
        document.getElementById('playbill-load').click();
    }

});

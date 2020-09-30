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
        var inputEl;
        if (schema.formType === "textarea") {
            // <textarea> is its own tag type. The rest are <input> tags.
            inputEl = document.createElement('textarea');
            inputEl.setAttribute('cols', '40');
            inputEl.setAttribute('rows', '4');

        } else if (schema.formType === "select") {
            // <select> requires us to set options.
            inputEl = document.createElement('select');
            inputEl.setAttribute('style', 'background-color: #FFF; height: 22px;');
            schema.allowed.unshift('');
            for (var i = 0; i < schema.allowed.length; i++) {
                var option = document.createElement('option');
                option.text = schema.allowed[i];
                inputEl.add(option);
            }

        } else if (schema.formType === "checkbox") {
            // <input> checkbox elements of entry form are displayed as dropdown selections.
            inputEl = document.createElement('select');
            inputEl.setAttribute('style', 'background-color: #FFF; height: 22px;');
            let allowed = ['', 'Yes', 'No'];
            for (var i = 0; i < allowed.length; i++) {
                var option = document.createElement('option');
                option.text = allowed[i];
                inputEl.add(option);
             }
        } else {
            // Everything else can be rendered with the same approach.
            inputEl = document.createElement('input');
            inputEl.setAttribute('size', '40');
            inputEl.setAttribute('type', schema.formType || 'text');
        }
        inputEl.setAttribute('id', id);
        inputEl.setAttribute('class', 'main-form-input newly-rendered');
        inputEl = wrapWith('div', inputEl, {'class': 'form-leaf-input'});

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
        if (id) {
            subRoot.setAttribute('id', id);
        }

        for (var attribKey in attribs) {
            subRoot.setAttribute(attribKey, attribs[attribKey]);
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
                    var newId = idPrefix + '_' + n;
                    var newHeader = itemName + ' ' + n;
                    recursiveRender(renderSubRoot(root), subForm, newId, newHeader);
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
        subRoot = renderSubRoot(root, id, {'class': 'subform-group'});

        // The button itself. The form for the first item in the
        // list will be rendered by the button callback, which
        // itself *calls this function again recursively*. So this
        // is a form of deferred recursion, even though it doesn't
        // look that way.
        var button = renderNewItemButton(
            subRoot, schema, id
        );
        button = wrapWith(
            'div', button, {'class': 'subform-group ui-element'}
        );
        root.appendChild(button);
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
            renderHeader(root, label, {'class': 'instance-header'});
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
        renderDict(formRoot, rootRecord);
        focusTop();
    }

    //////////////////// Reset form button //////////////////////////
    var reset = document.getElementById("clear-search");
    reset.addEventListener('click', function() {
        if (confirm("Are you sure you want to reset the form?")) {
            resetForm();
        } else {

        }
    });

    // Helper to parse id to search
    function idToApiPath(s) {
        var split = idToList(s);
        split = split.filter(el => isNaN(parseInt(el)));
        var path = split.join(".");
        return path;
    }

    // SEARCH INPUT
    var searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', function() {
        window.scrollTo(0,0);
        var elements = document.querySelectorAll('.main-form-input');
        var paths = [];
        var value;
        for (var i = 0; i < elements.length; i++) {
            value = elements[i].type === 'checkbox' ? elements[i].checked :
                elements[i].value;
            if (elements[i] != null && value != '') {

                path = idToApiPath(elements[i].id);

                if (value === 'Yes') {
                    path = '"' + path + '":true';
                } else if (value === 'No') {
                    path = '"' + path + '":false';
                } else if (value.trim().startsWith('{') && value.trim().endsWith('}')) {
                    path = '"' + path + '":' + value.trim();
                } else if (value.trim().startsWith('/') && value.trim().endsWith('/')) {
                    value = value.trim();
                    value = value.substring(1, value.length - 1);
                    path = '"' + path + '":{"$regex":"' + value + '"}';
                } else if (value.trim().startsWith('"') && value.trim().endsWith('"')) {
                    path = '"' + path + '":' + value.trim();
                } else {
                    path = '"' + path + '":"' + value + '"';
                }
                paths.push(path);
            }
        }

        // Http request
        var pathRoot = '/ephemeralRecord?';
        var pathWhere = 'where={' + paths.join(',') + '}';
        localStorage.setItem("searchQueryPath", pathRoot + pathWhere);

        // Construct map
        // renderMap();

        // Redirect to projection page
        window.location.href = '/projection';
    });

    resetForm();

});

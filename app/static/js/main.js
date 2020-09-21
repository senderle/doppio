document.addEventListener('DOMContentLoaded', function main () {

    displayLoginOption();
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
        labelEl = wrapWith('div', labelEl, {'class': 'form-leaf-label'});

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
            for (var i = 0; i < schema.allowed.length; i++) {
                var option = document.createElement('option');
                option.text = schema.allowed[i];
                inputEl.add(option);
            }
	} else if (schema.formType === "date") {
	    inputEl = document.createElement('input');
	    inputEl.setAttribute('type', 'date');
	    inputEl.setAttribute('value', '1799-12-31');
        } else {
            // Everything else can be rendered with the same approach.
            inputEl = document.createElement('input');
            inputEl.setAttribute('size', '40');
            inputEl.setAttribute('type', schema.formType || 'text');
        }
        inputEl.setAttribute('id', id);
        inputEl.setAttribute('class', 'main-form-input newly-rendered');

        // Here we create the event listeners that render help text when
        // a field gets focus or is hovered over.
        var renderHelpText = function() {
            var help = document.getElementById('help-window-text');
            var helpHeader = document.createElement('h5');
            var title = document.createTextNode(stripNum(label));
            var text = schema.documentation;
            text = document.createTextNode(text ? text : '(no documentation provided)');

            help.innerHTML = "";
            helpHeader.appendChild(title);
            help.appendChild(helpHeader);
            help.appendChild(text);
        };

        labelEl.addEventListener('mouseover', renderHelpText);
        inputEl.addEventListener('mouseover', renderHelpText);
        inputEl.addEventListener('focus', renderHelpText);
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
        renderHeader(root, label, {'class': 'subheader'});

        // Create a container to hold all the items along with
        // the button.
        subRoot = renderSubRoot(root,
                                id,
                                {'class': 'subform-group'});

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
        // renderSearch(formRoot, rootRecord, 'search');
        renderDict(formRoot, rootRecord);
        focusTop();
    }

    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////
    // Recursive object indexing and traversal
    //

    function assignKey(obj, keys, val) {
        keys = idToList(keys);

        if (keys.length < 1) {
            return;
        }

        // Convert the first key to an integer if it's an integer.
        var first = keys[0];
        first = isNaN(parseInt(first)) ? first : parseInt(first) - 1;

        // If it's the only value, this is a terminal key. End recursion.
        if (keys.length === 1) {
            obj[first] = val;
            return;
        }

        // If there are more values, we need to make sure they have an
        // object or array to live in, and to create one if not.
        if (!obj.hasOwnProperty(first)) {
            if (isNaN(parseInt(keys[1]))) {
                obj[first] = {};
            } else {
                obj[first] = [];
            }
        }

        // Now we can recurse...
        assignKey(obj[first], keys.slice(1), val);
    }

    function getKey(obj, keys) {
        keys = idToList(keys);

        if (keys.length < 1) {
            return;
        }

        var first = keys[0];
        first = isNaN(parseInt(first)) ? first : parseInt(first) - 1;

        if (keys.length === 1) {
            return obj ? obj[first] : null;
        } else {
            return obj ? getKey(obj[first], keys.slice(1)) : null;
        }
    }

    function walkObj(obj, callback, condition, keyPath) {
        var useCondition = (typeof condition === 'function') ? true : false;
        var keys, i;

        keyPath = keyPath || [];
        var newKeyPath = keyPath.slice();
        newKeyPath.push(null);

        if (Array.isArray(obj)) {
            keys = [];
            for (i = 0; i < obj.length; i++) {
                keys.push(i);
            }
        } else {
            keys = Object.keys(obj);
        }

        for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            var val = obj[key];
            newKeyPath[newKeyPath.length - 1] = key;

            if (!isPrimitive(val)) {
                callback(val, newKeyPath);
                walkObj(val, callback, condition, newKeyPath);
            } else if (!useCondition || condition(val, newKeyPath)) {
                callback(val, newKeyPath);
            }
        }
    }


    //////////////////// Reset form button //////////////////////////
    var reset = document.getElementById("reset-form-button");
    var statusAlert = document.getElementById('status-message-window');
    reset.addEventListener('click', function(){
      if (confirm("Are you sure you want to reset the form?")) {
        resetForm();
        statusAlert.innerHTML = '';
        loadFileChooser.value='';
      }
      else {

      }
    });

    ////////////////////////////////////////////////////////
    var secretReset = document.getElementById("reset-after-post");
    secretReset.addEventListener('click', function() {
        resetForm();
    });

    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////
    // Load/Save Records
    //

    // SAVE TO DB
    var submitButton = document.getElementById('playbill-submit');
    submitButton.addEventListener('click', function() {
        var elements = document.querySelectorAll('.main-form-input');
        var out = {};
        for (var i = 0; i < elements.length; i++) {
            var value = elements[i].type === 'checkbox' ? elements[i].checked :
                                                          elements[i].value;
            if(value !== "") {
                assignKey(out, elements[i].id, value);
            }
        }

        var jsonOut = JSON.stringify(out);
        var userid = localStorage.getItem("userid");
        var skey = localStorage.getItem("key");

        var token = localStorage.token;

        // This is supposed to allow us to specify the mongo ID for an
        // updated playbill. Unfortunately the UI doesn't make that at all
        // clear right now, so it's disabled until we can come up with
        // a good appraoch to that problem.
        // var patchid = document.getElementById('playbill-id').value;
        var patchid = '';

        var loadFileChooser = document.getElementById('local-load');
        if (patchid === '') {
            post_new_document(userid, token, 'ephemeralRecord', jsonOut.toString());
            loadFileChooser.value='';
        } else {
            patch_existing_document(userid, hash, 'ephemeralRecord', patchid, jsonOut.toString());
            loadFileChooser.value= '';
        }

        // var loc = out.ephemeralRecord.shows[0].location;
        // if (JSON.parse(lookupGeocode(loc))._items[0] == undefined) {
        //     post_loc_as_geocode(loc, token);
        // }
    });

    // SAVE TO FILE
    var saveButton = document.getElementById('playbill-save');
    saveButton.addEventListener('click', function() {
        var elements = document.querySelectorAll('.main-form-input');
        var out = {};
        for (var i = 0; i < elements.length; i++) {
            var value = elements[i].type === 'checkbox' ? elements[i].checked :
                                                          elements[i].value;
            assignKey(out, elements[i].id, value);
        }

        var filename = jsonToFilename(out) + '.yaml';

        var dl = document.createElement('a');
        dl.setAttribute('href', 'data:text/yaml;charset=utf-8,' +
                encodeURIComponent(jsyaml.safeDump(out)));
                // encodeURIComponent(JSON.stringify(out, null, 2)));
        dl.setAttribute('download', filename);
        dl.style.display = 'none';

        document.body.appendChild(dl);
        dl.click();
        document.body.removeChild(dl);

        event.preventDefault();
        return false;

    });

    // callback function for walkObj
    function walkObjHelper() {
        return function (val, keyPath) {
            keyPath = keyPath.slice();    // Mutating data, so make a copy.
            for (var i = 0; i < keyPath.length; i++) {
                if ((typeof keyPath[i]) === 'number') {
                    keyPath[i] += 1;
                }
            }

            var fieldId = listToId(keyPath);
            var tail = keyPath.pop();

            // Is the last value in keyPath a number? If so, this is
            // a list field. Check to see whether the corresponding
            // form fields have been created yet and create them if not.
            if ((typeof tail) === 'number') {
                var renderId = listToId(keyPath);

                if (document.getElementById(fieldId) === null) {
                    var renderer = subFormFactory
                        .getRendererFromKey[renderId];
                    if (renderer) {
                        renderer();
                    }
                }
            }
        };
    }

    // LOAD BY ID
    var loadRecord = document.getElementById('playbill-load');
    function loadRecordById() {
        statusAlert.innerHTML = '';
        var pid = (window.location.hash.substr(1) !== '') ? window.location.hash.substr(1) : document.getElementById('playbill-id').value;

        // Prepare the form for re-rendering.
        resetForm();

        var doc = get_document_by_id(pid);
        var obj = JSON.parse(doc);

        walkObj(obj, walkObjHelper());

        var elements = document.querySelectorAll('.main-form-input');
        for (var i = 0; i < elements.length; i++) {
            var key = elements[i].id;
            var value = getKey(obj, key);
              if (elements[i].type === 'checkbox') {
                  elements[i].checked = value;
              } else if (value !== undefined) {
                  elements[i].value = value;
              }

        }

        focusTop();
    }
    loadRecord.addEventListener('click', loadRecordById);

    // LOAD FROM LOCAL JSON FILE
    var loadFileChooser = document.getElementById('local-load');

    loadFileChooser.addEventListener('change', function(evt) {
        var files = evt.target.files;
        var file = files[0];
        var reader = new FileReader();

        // Prepare the form for re-rendering.
        resetForm();

        reader.addEventListener('load', function(evt) {
  	        var obj = null;
            let parseObj = null;

            if (file.name.endsWith('.json')) {
                parseObj = JSON.parse;
            } else {
                parseObj = jsyaml.safeLoad;
            }

            try {
                obj = parseObj(evt.target.result);
            } catch (error) {
                alert('Couldn\'t open local file. Error details:\n\n' + error);
                throw error;
            }

            walkObj(obj, walkObjHelper());
            var elements = document.querySelectorAll('.main-form-input');
            for (var i = 0; i < elements.length; i++) {
                var key = elements[i].id;
                var value = getKey(obj, key);

                if (elements[i].type === 'checkbox') {
                    elements[i].checked = value;
                } else if (value !== undefined) {
                    elements[i].value = value;
                }

            }
            focusTop();
        });
        reader.readAsText(file);
    });

    resetForm();

    if (window.location.hash.substr(1) !== '') {
        loadRecordById();
    }

});

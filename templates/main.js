document.addEventListener('DOMContentLoaded', function main () {
    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////
    // Schema
    //

    var req = new XMLHttpRequest();
    req.open("GET", "/schema.json", false);
    req.send();
    var playbillRecord = JSON.parse(req.responseText);

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

    function renderInput(root, label, id, attribs) {
        var labelEl = document.createElement('label');
        var labelText = document.createTextNode(label);
        labelEl.appendChild(labelText);
        labelEl.setAttribute('for', id);
        labelEl = wrapWith('div', labelEl);

        var inputEl;
        if (attribs.formType === "textarea") {
            inputEl = document.createElement('textarea');
            inputEl.setAttribute('cols', '40');
            inputEl.setAttribute('rows', '4');
        }     else if (attribs.formType === "select") {
            inputEl = document.createElement('select');
            inputEl.setAttribute('style', 'background-color: #FFF; height: 22px;');
            for (var i = 0; i < attribs.allowed.length; i++) {
                var option = document.createElement('option');
                option.text = attribs.allowed[i];
                inputEl.add(option);
            }
        }     else {
            inputEl = document.createElement('input');
            inputEl.setAttribute('size', '40');
            inputEl.setAttribute('type', attribs.formType || 'text');
        }
        inputEl.setAttribute('id', id);
        inputEl.setAttribute('class', 'main-form-input newly-rendered');

        var renderHelpText = function() {
            var help = document.getElementById('help-window-text');
            var helpHeader = document.createElement('h5');
            var title = document.createTextNode(stripNum(label));
            var text = document.createTextNode(attribs.documentation);

            help.innerHTML = "";
            helpHeader.appendChild(title);
            help.appendChild(helpHeader);
            help.appendChild(text);
        };
        inputEl.addEventListener('mouseover', renderHelpText);
        inputEl.addEventListener('focus', renderHelpText);
        inputEl = wrapWith('div', inputEl);

        var container = document.createElement('p');
        container.appendChild(labelEl);
        container.appendChild(inputEl);
        root.appendChild(container);
        return container;
    }

    function renderHeader(root, text, attribs) {
        var headerText = document.createTextNode(text);
        var header = document.createElement('h3');

        for (var attribKey in attribs) {
            header.setAttribute(attribKey, attribs[attribKey]);
        }
        header.appendChild(headerText);
        root.appendChild(header);
        return header;
    }

    function renderSubRoot(root, id, attribs) {
        var subRoot = document.createElement('div');
        subRoot.setAttribute('id', id);

        for (var attribKey in attribs) {
            subRoot.setAttribute(attribKey, attribs[attribKey]);
        }
        root.appendChild(subRoot);
        return subRoot;
    }

    subFormFactory = (function() {
        // A factory object that creates and keeps track of the callbacks
        // that render new copies of forms that can be repeated. For
        // example, if a scheme allows multiple `tree`s in a list, this
        // renders a new `tree` sub-form each time it is called, with
        // a key that reflects its order of creation. (tree_1, tree_2, etc.)

        var factory = {};
        factory.getRendererFromKey = {};
        factory.buildRenderer = function(root, key, subForm, idPrefix) {

            var renderSubForm = function(n) {
                // This closure maintains the renderFunc's state (`n`).
                var renderFunc = function() {
                    // This function renders the actual form, tracking
                    // and updating the value of `n` attached to its closure.
                    var newHeader = singular(titleCase(key)) + ' ' + n;
                    var newId = toId(key, idPrefix) + '_' + n;
                    render(renderSubRoot(root), subForm, newId, newHeader);
                    if (n > 1) {
                        focusRendered();
                    }

                    n += 1;
                    event.preventDefault();
                    return false;
                };

                factory.getRendererFromKey[toId(key, idPrefix)] = renderFunc;
                return renderFunc;
            };

            return renderSubForm(1);
        };

        return factory;
    })();

    function renderNewItemButton(root, key, subForm, idPrefix) {
        var renderSubForm = subFormFactory.buildRenderer(
            root, key, subForm, idPrefix
        );

        var button = document.createElement('a');
        var text = document.createTextNode(
                '+ New ' + singular(titleCase(key))
        );

        button.setAttribute('href', '#');
        button.setAttribute('class', 'button');
        button.appendChild(text);
        button.addEventListener('click', renderSubForm);
        renderSubForm();
        return button;
    }

    function render(root, formSpec, idPrefix, header) {
        var formKeys;
        var renderButton;
        idPrefix = idPrefix ? idPrefix : '';

        if(formSpec.type == 'list') {
            formKeys = ['schema'];
        } else {
            if (formSpec.schema) {
                formSpec = formSpec.schema;
            }
            formKeys = Object.keys(formSpec);
            formKeys.sort(function cmp(a, b) {
                if (isLeaf(formSpec[a])) {
                    if (!isLeaf(formSpec[b])) {
                        return -1;
                    }
                } else {
                    if (isLeaf(formSpec[b])) {
                        return 1;
                    }
                }
                return a < b ? -1 : a == b ? 0 : 1;
            });
        }

        for (var i = 0; i < formKeys.length; i++) {
            var key = formKeys[i];
            if (!formSpec.hasOwnProperty(key)) {
                continue;
            }

            var subForm = formSpec[key];
            if (formSpec.type == 'list') {
                                            // The new item renderer will
                key = '';                     // handle keys for sequences.
            }

            var subHeader = header ? header : titleCase(key);
            var subRoot;

            var nodeId = toId(key, idPrefix);
            if (isLeaf(subForm)) {
                renderInput(root, subHeader, nodeId, subForm);
            } else if (subForm.type == 'list') {
                renderHeader(root, subHeader, {'class': 'subheader'});
                subRoot = renderSubRoot(root,
                                        nodeId,
                                        {'class': 'subform-group'});
                var button = renderNewItemButton(
                        subRoot, key, subForm, idPrefix);
                button = wrapWith('div', button,
                        {'class': 'subform-group ui-element'});
                root.appendChild(button);
            } else {
                renderHeader(root, subHeader, {'class': 'instance-header'});
                render(renderSubRoot(root, nodeId),
                         subForm,
                         nodeId);
            }
        }
    }

    function resetForm() {
        var formRoot = document.getElementById('playbill-form');
        while (formRoot.lastChild) {
            formRoot.removeChild(formRoot.lastChild);
        }
        render(formRoot, playbillRecord);
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

    /*function getFormContent() {
        var elements = document.querySelectorAll('.main-form-input');
        var out = {};
        for (var i = 0; i < elements.length; i++) {
            var value = elements[i].type === 'checkbox' ? elements[i].checked :
                                                            elements[i].value;
            if(value !== "") {
                assignKey(out, elements[i].id, value);
            }
        }
        console.log(JSON.stringify(out));
        return out;
    }*/

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
        //var out = getFormContent();
        var jsonOut = JSON.stringify(out);
        var userid = localStorage.getItem("userid");
        var skey = localStorage.getItem("key");

        hash = hmac_hash(jsonOut.toString(), skey);
        var patchid = document.getElementById('playbill-id').value;

        var loadFileChooser = document.getElementById('local-load');
        if(patchid === '') {
            post_new_document(userid, hash, 'ephemeralRecord', jsonOut.toString());
            loadFileChooser.value='';

        }
        else{
            patch_existing_document(userid, hash, 'ephemeralRecord', patchid, jsonOut.toString());
            loadFileChooser.value= '';
        }
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

        //console.log(out);
        var filename = jsonToFilename(out);

        //var out = getFormContent();
        //console.log(JSON.stringify(out));
        //var filename = jsonToFilename(out);

        var dl = document.createElement('a');
        dl.setAttribute('href', 'data:text/plain;charset=utf-8,' +
                encodeURIComponent(JSON.stringify(out, null, 2)));
        dl.setAttribute('download', filename);
        dl.style.display = 'none';

        document.body.appendChild(dl);
        dl.click();
        document.body.removeChild(dl);

        event.preventDefault();
        return false;
    });

    // callback function for walkObj
    function walkObjHelper () {
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
            // an array field. Check to see whether the corresponding
            // form fields have been created yet and create them if not.
            if ((typeof tail) === 'number') {
                var renderId = listToId(keyPath);

                if (document.getElementById(fieldId) === null) {
                    var render = subFormFactory
                        .getRendererFromKey[renderId];
                    if (render) {
                        render();
                    }
                }
            }
        };
    }

    // LOAD BY ID
    var loadRecord = document.getElementById('playbill-load');
    loadRecord.addEventListener('click', function() {

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
    });

    // LOAD FROM LOCAL JSON FILE
    var loadFileChooser = document.getElementById('local-load');

    loadFileChooser.addEventListener('change', function(evt) {
        var files = evt.target.files;
        var file = files[0];
        var reader = new FileReader();

        // Prepare the form for re-rendering.
        resetForm();

        reader.addEventListener('load', function(evt) {
            obj = JSON.parse(evt.target.result);

            walkObj(obj, walkObjHelper());
            var elements = document.querySelectorAll('.main-form-input');
            for (var i = 0; i < elements.length; i++) {
                var key = elements[i].id;
                var value = getKey(obj, key);

                if (elements[i].type === 'checkbox') {
                    elements[i].checked = value;
                } else {
                    elements[i].value = value;
                }
            }
            focusTop();
        });
        reader.readAsText(file);
    });

    resetForm();

    if (window.location.hash.substr(1) !== '') {
        document.getElementById('playbill-load').click();
    }

});

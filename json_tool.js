document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('jsonInput');
    const validateButton = document.getElementById('validateButton');
    const formatButton = document.getElementById('formatButton');
    const compressButton = document.getElementById('compressButton');
    const indentSpacesSelect = document.getElementById('indentSpaces');
    const validationMessage = document.getElementById('validationMessage');
    const formattedJsonOutput = document.getElementById('formattedJsonOutput');
    const jsonTreeView = document.getElementById('jsonTreeView'); // For later use

    // --- 1. JSON 校验 ---
    function validateJson(showSuccess = true) {
        const jsonString = jsonInput.value.trim();
        validationMessage.textContent = '';
        validationMessage.className = 'message'; // Reset class

        if (!jsonString) {
            validationMessage.textContent = '请输入 JSON 数据进行校验。';
            validationMessage.classList.add('error');
            return null;
        }

        try {
            const jsonObj = JSON.parse(jsonString);
            if (showSuccess) {
                validationMessage.textContent = 'JSON 数据有效！';
                validationMessage.classList.add('success');
            }
            return jsonObj;
        } catch (error) {
            let errorMessage = `JSON 无效：${error.message}`;
            // Try to find error location (simple approach)
            const match = error.message.match(/position (\d+)/);
            if (match && match[1]) {
                const position = parseInt(match[1], 10);
                errorMessage += ` (在位置 ${position})`;
                // Highlight error in textarea (basic)
                // More advanced highlighting would require a more complex setup
                // jsonInput.focus();
                // jsonInput.setSelectionRange(position, position + 1);
            }
            validationMessage.textContent = errorMessage;
            validationMessage.classList.add('error');
            return null;
        }
    }

    validateButton.addEventListener('click', () => {
        validateJson();
    });

    // Live validation (optional, can be performance intensive for large JSON)
    // jsonInput.addEventListener('input', () => validateJson(false));


    // --- 2. JSON 格式化 ---
    formatButton.addEventListener('click', () => {
        const jsonObj = validateJson(false); // Validate first, don't show success message here
        if (jsonObj) {
            const indentValue = indentSpacesSelect.value;
            let indent;
            if (indentValue === 'tab') {
                indent = '\t';
            } else {
                indent = parseInt(indentValue, 10);
            }
            try {
                const formattedJson = JSON.stringify(jsonObj, null, indent);
                formattedJsonOutput.textContent = formattedJson;
                validationMessage.textContent = 'JSON 格式化成功！';
                validationMessage.className = 'message success'; // Set success
                // Clear tree view if it was populated
                jsonTreeView.innerHTML = '';
            } catch (error) {
                validationMessage.textContent = `格式化错误: ${error.message}`;
                validationMessage.className = 'message error';
                formattedJsonOutput.textContent = '';
            }
        } else {
            formattedJsonOutput.textContent = ''; // Clear output if validation failed
            if (!jsonInput.value.trim()) { // If input is empty, clear validation message too
                 validationMessage.textContent = '请输入 JSON 数据进行格式化。';
                 validationMessage.className = 'message error';
            }
        }
    });

    // --- 3. JSON 压缩 ---
    compressButton.addEventListener('click', () => {
        const jsonObj = validateJson(false); // Validate first
        if (jsonObj) {
            try {
                const compressedJson = JSON.stringify(jsonObj);
                formattedJsonOutput.textContent = compressedJson;
                validationMessage.textContent = 'JSON 压缩成功！';
                validationMessage.className = 'message success';
                // Clear tree view if it was populated
                jsonTreeView.innerHTML = '';
            } catch (error) {
                validationMessage.textContent = `压缩错误: ${error.message}`;
                validationMessage.className = 'message error';
                formattedJsonOutput.textContent = '';
            }
        } else {
            formattedJsonOutput.textContent = ''; // Clear output if validation failed
             if (!jsonInput.value.trim()) {
                 validationMessage.textContent = '请输入 JSON 数据进行压缩。';
                 validationMessage.className = 'message error';
            }
        }
    });

    // --- 4. JSON 可视化 (树状视图) ---
    function createTreeViewNode(key, value, parentElement, isInitiallyOpen = false) {
        const listItem = document.createElement('li');
        const keySpan = document.createElement('span');
        keySpan.className = 'key';
        if (key !== null) { // Array items might not have a string key (we'll use index for display)
            keySpan.textContent = `${JSON.stringify(key)}: `;
        }


        if (typeof value === 'object' && value !== null) {
            const toggler = document.createElement('span');
            toggler.className = 'toggler';
            // listItem.appendChild(toggler); // Toggler first for objects/arrays
            listItem.insertBefore(toggler, listItem.firstChild);


            listItem.appendChild(keySpan); // Then the key

            const typeLabel = document.createElement('span');
            const itemCount = Object.keys(value).length;
            typeLabel.textContent = Array.isArray(value) ? `Array[${itemCount}]` : `Object {${itemCount}}`;
            typeLabel.style.marginLeft = '5px';
            typeLabel.style.color = '#777';
            listItem.appendChild(typeLabel);

            const nestedList = document.createElement('ul');
            if (isInitiallyOpen) {
                toggler.classList.add('open');
            } else {
                nestedList.className = 'hidden';
            }

            toggler.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling to parent list items
                nestedList.classList.toggle('hidden');
                toggler.classList.toggle('open');
            });

            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    // Pass index as key for arrays for display purposes
                    createTreeViewNode(`[${index}]`, item, nestedList, false);
                });
            } else {
                for (const prop in value) {
                    if (Object.prototype.hasOwnProperty.call(value, prop)) {
                        createTreeViewNode(prop, value[prop], nestedList, false);
                    }
                }
            }
            listItem.appendChild(nestedList);
        } else {
            listItem.appendChild(keySpan); // Key first for simple types
            const valueSpan = document.createElement('span');
            let type = typeof value;
            if (value === null) {
                type = 'null';
            }
            valueSpan.className = type; // string, number, boolean, null
            valueSpan.textContent = JSON.stringify(value);
            listItem.appendChild(valueSpan);
        }
        parentElement.appendChild(listItem);
    }

    function buildTreeView(obj, parentElement) {
        parentElement.innerHTML = ''; // Clear previous tree
        if (typeof obj === 'object' && obj !== null) {
            const rootList = document.createElement('ul');
            if (Array.isArray(obj)) {
                 obj.forEach((item, index) => {
                    // For root array, pass index as key, initially open
                    createTreeViewNode(`[${index}]`, item, rootList, true);
                });
            } else {
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        // For root object, pass key, initially open
                        createTreeViewNode(key, obj[key], rootList, true);
                    }
                }
            }
            parentElement.appendChild(rootList);
        } else {
            // Handle cases where the root JSON is not an object or array (e.g. just a string or number)
            const item = document.createElement('div'); // Use div for non-object root
            const valueSpan = document.createElement('span');
            let type = typeof obj;
            if (obj === null) type = 'null';
            valueSpan.className = type;
            valueSpan.textContent = JSON.stringify(obj);
            item.appendChild(valueSpan);
            parentElement.appendChild(item);
        }
    }

    // Modify validate, format, and compress functions to call buildTreeView
    validateButton.addEventListener('click', () => {
        const jsonObj = validateJson(); // showSuccess is true by default
        if (jsonObj) {
            formattedJsonOutput.textContent = ''; // Clear formatted/compressed output
            buildTreeView(jsonObj, jsonTreeView);
        } else {
            jsonTreeView.innerHTML = ''; // Clear tree view on error
        }
    });

    formatButton.addEventListener('click', () => {
        const jsonObj = validateJson(false);
        if (jsonObj) {
            const indentValue = indentSpacesSelect.value;
            let indent;
            if (indentValue === 'tab') {
                indent = '\t';
            } else {
                indent = parseInt(indentValue, 10);
            }
            try {
                const formattedJson = JSON.stringify(jsonObj, null, indent);
                formattedJsonOutput.textContent = formattedJson;
                validationMessage.textContent = 'JSON 格式化成功！';
                validationMessage.className = 'message success';
                buildTreeView(jsonObj, jsonTreeView);
            } catch (error) {
                validationMessage.textContent = `格式化错误: ${error.message}`;
                validationMessage.className = 'message error';
                formattedJsonOutput.textContent = '';
                jsonTreeView.innerHTML = '';
            }
        } else {
            formattedJsonOutput.textContent = '';
            jsonTreeView.innerHTML = '';
            if (!jsonInput.value.trim()) {
                validationMessage.textContent = '请输入 JSON 数据进行格式化。';
                validationMessage.className = 'message error';
            }
        }
    });

    compressButton.addEventListener('click', () => {
        const jsonObj = validateJson(false);
        if (jsonObj) {
            try {
                const compressedJson = JSON.stringify(jsonObj);
                formattedJsonOutput.textContent = compressedJson;
                validationMessage.textContent = 'JSON 压缩成功！';
                validationMessage.className = 'message success';
                buildTreeView(jsonObj, jsonTreeView);
            } catch (error) {
                validationMessage.textContent = `压缩错误: ${error.message}`;
                validationMessage.className = 'message error';
                formattedJsonOutput.textContent = '';
                jsonTreeView.innerHTML = '';
            }
        } else {
            formattedJsonOutput.textContent = '';
            jsonTreeView.innerHTML = '';
             if (!jsonInput.value.trim()) {
                 validationMessage.textContent = '请输入 JSON 数据进行压缩。';
                 validationMessage.className = 'message error';
            }
        }
    });
});
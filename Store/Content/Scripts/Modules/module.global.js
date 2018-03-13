'use strict';

$.fn.nval = function() {
   return Number(this.val())
};

const Global = (function () {
    
    const init = function () {

    }

    const editCapitalizeFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const getNewId = function () {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let autoId = '';
        for (let i = 0; i < 20; i++)
            autoId += chars.charAt(Math.floor(Math.random() * chars.length));
        return autoId;
    }
    const getHtmlInputs = function (obj) {

        let html = ``;

        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                console.log(property);
                console.log(obj[property]);

                const name = Global.editCapitalizeFirstLetter(property);

                if (typeof obj[property] === `string`)
                    html += `<m-input>
                        <label for="txt${name}">${name}</label>
                        <input type="text" id="txt${name}" placeholder="${name}" value="" required />
                    </m-input>

                    `;
                else if (typeof obj[property] === `number` && obj[property] == 0)
                    html += `<m-input>
                        <label for="txt${name}">${name}</label>
                        <input type="number" id="txt${name}" placeholder="${name}" value="" required />
                    </m-input>

                    `;
                else if (typeof obj[property] === `number` && obj[property] == 1)
                    html += `<m-input>
                        <label for="dbo${name}">${name}</label>
                        <select id="dbo${name}" required>
                            <option value="">Select</option>
                        </select>
                    </m-input>

                    `;
                else if (typeof obj[property] === `boolean`)
                    html += `<m-input>
                        <m-flex data-type="row" class="n">
                            <label for="chk${name}">${name}</label>
                            <input type="checkbox" id="chk${name}" />
                        </m-flex>
                    </m-input>

                    `;
                
            }

        }
        
        console.log(html);

    }
    const getArrayFromQuerySnapshot = function (querySnapshot) {
        let arr = [];
        querySnapshot.forEach(function(doc) {
            let obj = doc.data();
            obj["id"] = doc.id;
            arr.push(obj);
        });
        return arr;
    }
    const getHtmlOptions = function (arr, value = ``) {

        let html = ``;

        for (let obj of arr)
            html += `<option value="${obj.value}" ${(value == obj.value) ? `selected` : ``}>${obj.name}</option>`;

        return html;

    }

    return {
        init: init,
        editCapitalizeFirstLetter: editCapitalizeFirstLetter,
        getNewId: getNewId,
        getHtmlInputs: getHtmlInputs,
        getArrayFromQuerySnapshot: getArrayFromQuerySnapshot,
        getHtmlOptions: getHtmlOptions
    }

})();
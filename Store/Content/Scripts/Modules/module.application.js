'use strict';

//Store
// Initialize Firebase
var config = {
    apiKey: "AIzaSyDwaJ9MevlnVuwOBeGnnMW7S7pet3dX4P4",
    authDomain: "ciclops-3decb.firebaseapp.com",
    databaseURL: "https://ciclops-3decb.firebaseio.com",
    projectId: "ciclops-3decb",
    storageBucket: "ciclops-3decb.appspot.com",
    messagingSenderId: "963639005172"
};
firebase.initializeApp(config);
const db = firebase.firestore();

const Application = (function () {

    //Private ----------------------------------------------------------
    const _easing = [.54, -0.23, .45, 1.26];
    const _durationShort = 200;
    const _durationLong = 700;
    
    const _keyUp = function (e) {
        
        //if (e.which == 13)
        //    if (Application.type == 'SignIn.getHtmlCard')
        //        SignIn.signIn();
        //    else if (Application.type == 'SignUp.getHtmlCard')
        //        SignUp.signUp();
        //    else if (Application.type == 'ForgotPassword.getHtmlCard')
        //        ForgotPassword.forgotPassword();
        //    else if (Application.type == 'ForgotPassword.getHtmlCardReset')
        //        ForgotPassword.resetForgotPassword();

    }
    const _onAuthChange = function (user) {
        
        console.log(user);
        $(`m-authentication, m-body`).remove();

        if (!user) {
            $(`body`).prepend(`<m-authentication>${SignIn.getHtmlCard()}</m-authentication>`);
        } else if (!user.emailVerified) {
            $(`body`).prepend(`<m-authentication>${SignUp.getHtmlCardValidate()}</m-authentication>`);
        } else if (user.emailVerified) {
            $(`body`).prepend(Application.getHtml());
        }

    }
    const _signOut = function () {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
            console.log(`signed out`);
        }).catch(function(error) {
            // An error happened.
        });
    }

    //Public ----------------------------------------------------------
    const Load = (function () {
    
        //Private ----------------------------------------------------------

        //Public ----------------------------------------------------------
        const init = function () {
            
            Application.init();
            Module.init();
            SignIn.init();
            SignUp.init();
            ForgotPassword.init();
            AutomateCanvas.init();

            Order.init();
            Item.init();
            Element.init();
            Company.init();
            
            AutomateCanvas.start(Order.is);

        }

        return {
            init: init
        }

    })();
    
    const keyUpTimeout = 250;
    const velocitySettings = {
        easing: _easing,
        durationShort: _durationShort,
        durationLong: _durationLong,
        options: { duration: _durationShort, easing: _easing },
        optionsFlex: { display: 'flex', duration: _durationShort, easing: _easing }
    };
    const init = function () {
        firebase.auth().onAuthStateChanged(function(user) { _onAuthChange(user); });
        $(document).on('keyup', function (e) { _keyUp(e); });
        $(document).on(`tap`, `#btnSignOut`, function (e) { _signOut(); });
        window.onerror = function(msg, url, line, col, error) { 
            if (msg == `Script error.`) return;
            Application.addError(msg, url, line, col, error); 
        };
    }
    
    const addError = function (msg, url, line, col, error) {
        
        if (error.includes('password')) error = 'vm';

        let details = (!col) ? '' : '\ncolumn: ' + col;
        details += (!error) ? '' : '\nerror: ' + error;
        
        //console.log("Error: " + msg + "\nurl: " + url + "\nline: " + line + details);
        
        const vm = {
            errorId: `00000000-0000-0000-0000-000000000000`,
            message: msg,
            url: url,
            line: line,
            details: details,
            solved: false,
            isDeleted: false
        }

        //NEED TO IMPLEMENT ON DB
        //$.ajax({
        //    type: "POST",
        //    url: '/Methods/Get',
        //    data: {
        //        vm: JSON.stringify(vm),
        //        m: 'Error_AddEditDelete'
        //    },
        //    dataType: "json"
        //});

    }
    
    const getFunctionByName = function (functionName, args) {
        
        const namespaces = functionName.split(".");
        const func = namespaces.pop();
        let ns = namespaces.join('.');

        if(ns == '')
            ns = 'window';

        ns = eval(ns);
        
        return (typeof(args) === 'string') ? ns[func].apply( this, args.split(`,`) ) : ns[func](args);

    }

    const getHtml = function () {
        return `

            <m-body aria-label="Main">
                Logged In <m-button data-type="primary" id="btnSignOut">Sign Out</m-button>
                <input type="range" min="10" max="100" id="rngEditZoom" />
            </m-body>

            `;
    }
    
    return {
        Load: Load,
        keyUpTimeout: keyUpTimeout,
        velocitySettings: velocitySettings,
        init: init,
        addError: addError,
        getFunctionByName: getFunctionByName,
        getHtml: getHtml
    }

})();

const Order = (function () {

    //Private ---------------------------------------------
    let _timeout;
    
    //Public ----------------------------------------------
    let is = {
        orderId: ``,
        name: `Jacob Berding`,
        callback: function (order) { 
            //_downloadZip(order);
            AutomateCanvas.getCanvas(order);
        },
        company: {
            companyId: ``,
            fontHeader: `Great Vibes`,
            fontSubHeader: `Lora`,
            fontBody: `Didact Gothic`,
            voidShape: 1
        },
        files: [{
            orderFileId: ``,
            orderId: ``,
            path: `https://files.themolo.com/_orders/thumbnails/fde474a5-2f51-484c-98de-d8cc5658a6ec.jpg`,
            originalFileName: ``,
            width: 700,
            height: 525,
            resolutionHorizontal: 0,
            resolutionVertical: 0,
            contentLength: 0,
            type: 1, //1 user uploaded
            isWarning: false,
            isPrimary: true,
            isDeleted: false
        },{
            orderFileId: ``,
            orderId: ``,
            path: `https://files.themolo.com/_companies/5c2e8f58-e56e-4a9b-81c0-c9ba729255cc.png`,
            originalFileName: ``,
            width: 498,
            height: 172,
            resolutionHorizontal: 0,
            resolutionVertical: 0,
            contentLength: 0,
            type: 5, //5 company template logo
            isWarning: false,
            isPrimary: false,
            isDeleted: false
        }],
        events: [{
            orderEventId: ``,
            orderId: ``,
            type: 1, //1 Visitation 2 Funeral 3 Cemetery
            name: `Visitation Service for Family`,
            startDate: `02/08/2017`,
            startTime: `11:00am`,
            endDate: `02/08/2017`,
            endTime: `1:00pm`,
            location: `Our Lady of Victory`,
            address: `5415 Dengail Dr`,
            section: ``,
            officiant: `Jacob Berding`,
            details: ``
        }],
        items: [{ 
            itemId: ``,
            name: ``,
            number: 0,
            unitPrice: 1,
            costOfGoods: 1,
            startingQuantity: 10,
            incrementalQuantity: 10,
            width: 702,//648,//2430,
            height: 1026,//1890,//3726,
            bleed: 24,
            trim: 24,
            weight: 1,
            description: ``,
            productSpecifications: ``,
            isVerified: true,
            discounts: [{
                quantity: 50,
                percentOffUnitPrice: 25
            }],
            pages: [{
                pageId: ``,
                canvas: {},
                context: {},
                toDataURL: ``,
                sortOrder: 1,
                backgroundType: 1,//1 color 2 template
                align: 2, //1 top 2 center 3 bottom
                isAutomated: true,
                isDeleted: false,
                groups: [
                {
                    groupId: ``,
                    type: 4, //1 Event 2 Logo 3 Name DOB DOD 4 Photo
                    eventType: 0,
                    sortOrder: 1,
                    isEvent: false,
                    isDeleted: false
                },
                {
                    groupId: ``,
                    type: 3, //1 Event 2 Logo 3 Name DOB DOD 4 Photo
                    eventType: 0,
                    sortOrder: 2,
                    isEvent: false,
                    isDeleted: false
                },
                //{
                //    groupId: ``,
                //    pageId: ``,
                //    type: 1, //1 Event 2 Logo 3 Name DOB DOD 4 Photo
                //    eventType: 1,
                //    sortOrder: 3,
                //    isEvent: true,
                //    isDeleted: false
                //},
                //{
                //    groupId: ``,
                //    pageId: ``,
                //    type: 2, //1 Event 2 Logo 3 Name DOB DOD 4 Photo
                //    eventType: 0,
                //    sortOrder: 4,
                //    isEvent: false,
                //    isDeleted: false
                //}
                ],
                elements: []
            }]
        }]
    };
    const init = function () {

    }
    
    return {
        is: is,
        init: init
    }

})();
const Item = (function () {

    //Private ---------------------------------------------
    let _timeout;

    const _editPageAlign = function (val) {
        Order.is.items[0].pages[0].align = val;
        AutomateCanvas.start(Order.is);
    }
    
    //Public ----------------------------------------------
    const init = function () {
        $(document).on(`change`, `#dboPageAlign`, function () { _editPageAlign($(this).val()); });
    }
    
    const getHtmlModuleSettings = function () {
        return `

            <m-header>
                <m-flex data-type="row" class="n c sQ h secondary btnCloseModule">
                    <i class="icon-delete-3"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-delete-3"></use></svg></i>
                </m-flex>
            </m-header>

            <m-body>
                <select id="dboPageAlign">
                    <option value="1">Top</option>
                    <option value="2">Center</option>
                    <option value="3">Bottom</option>
                </select>
            </m-body>

            `;
    }

    return {
        init: init,
        getHtmlModuleSettings: getHtmlModuleSettings
    }

})();
const Element = (function () {

    //Private ---------------------------------------------
    let _timeout;
    
    //Public ----------------------------------------------
    const init = function () {

    }
    
    const getById = function (id) {

        let arr = [];

        for (let item of Order.is.items)
            for (let page of item.pages)
                arr = arr.concat(page.elements);

        return arr.filter(function (obj) { return obj.elementId == id; })[0];

    }
    const getHtml = function (id) {

        const obj = Element.getById(id);

        return `

            <m-header>
                <m-flex data-type="row" class="n c sQ h secondary btnCloseModule" data-position="right">
                    <i class="icon-delete-3"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-delete-3"></use></svg></i>
                </m-flex>
                <m-flex data-type="row" class="n c sQ h secondary btnOpenModule" data-function="Element.getHtmlLayers" data-position="right">
                    <i class="icon-layers"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-layers"></use></svg></i>
                </m-flex>
            </m-header>

            <m-body>
                ${obj.text}
            </m-body>

            `;
    }
    const getHtmlLayers = function () {
        return `

            <m-header>
                <m-flex data-type="row" class="n c sQ h secondary btnCloseModule" data-position="right">
                    <i class="icon-delete-3"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-delete-3"></use></svg></i>
                </m-flex>
            </m-header>

            <m-body>
                Layers
            </m-body>

            `;
    }

    return {
        init: init,
        getById: getById,
        getHtml: getHtml,
        getHtmlLayers: getHtmlLayers
    }

})();

const Company = (function () {

    //Private ---------------------------------------------
    let _timeout;
    let _arr = [];

    const _add = function () {
        Company.is = {
            id: ``,
            name: $(`#txtCompany`).val(),
            email: $(`#txtEmail`).val()
        };
        _reset();
    }
    const _addSelect = function (id) {
        Company.is = _arr.filter(function (obj) { return obj.id == id; })[0];
        _reset();
    }

    const _delete = function () {
        $(`#txtCompany`).val(Company.is.name);
        $(`.lstCompanies m-card`).remove();
        Company.is = {
            id: ``,
            name: ``,
            email: ``
        };
    }

    const _getCompanySignUp = function (value) {
        
        clearTimeout(_timeout);
        _timeout = setTimeout(function () {
        
            db.collection("companies")
                .where("nameToLowerCase", ">=", value.toLowerCase())
                .orderBy("nameToLowerCase")
                .limit(5)
                .get()
                .then(function(querySnapshot) {
                    console.log(querySnapshot.docs);
                    _arr = Global.getArrayFromQuerySnapshot(querySnapshot);
                    $(`#txtCompany`).parent().find(`.absolute`).remove();
                    $(`#txtCompany`).parent().append(_getHtmlBodyList(_arr));
                })
                .catch(function(error) {
                    console.log("Error getting documents: ", error);
                });

        //    const vm = {
        //        search: value
        //    }
            
        //    console.log(vm);
        //    Application.post(`Company_GetSignUp`, vm)
        //        .done(function (data) {
        //            console.log(data);
        //        })
        //        .fail(function (data) {
        //            console.log(data);
        //        });
        
        }, Application.keyUpTimeout);

    }

    const _getHtmlBodyList = function (arr) {
        
        let html = ``;

        for (let obj of arr)
            html += Company.getHtmlCard(obj, true);
        
        return `

            <m-flex data-type="col" class="n absolute w d2">
                <m-flex data-type="col" class="n list selectable">
                    <h2>Select an existing company or create a new company.</h2>
                    ${html}
                </m-flex>
                <m-flex data-type="row" class="footer">
                    <m-button data-type="secondary" class="btnCloseCompany">
                        Cancel
                    </m-button>
                    <m-button data-type="primary" class="btnAddCompany">
                        Create
                    </m-button>
                </m-flex>
            </m-flex>
    
            `;
    }

    const _close = function () {
        $(`#txtCompany`).parent().find(`.absolute`).remove();
    }
    const _reset = function () {
        $(`#txtCompany`).val(``);
        $(`#txtCompany`).parent().find(`.absolute`).remove();
        $(`.lstCompanies m-card`).remove();
        $(`.lstCompanies`).append(Company.getHtmlCard(Company.is, false));
    }

    //Public ----------------------------------------------
    let is = {
        id: ``,
        name: ``,
        email: ``
    };
    const init = function () {
        $(document).on(`tap`, '.btnAddCompany', function() { _add(); });
        $(document).on(`tap`, '.btnSelectCompany', function() { _addSelect($(this).attr(`data-id`)); });
        $(document).on(`tap`, '.btnDeleteCompany', function() { _delete($(this).attr(`data-id`)); });
        $(document).on(`tap`, '.btnCloseCompany', function() { _close(); });
        $(document).on(`keyup`, '#txtCompany', function() { _getCompanySignUp($(this).val()); });
    }
    
    const getHtmlCard = function (obj, isAdd) {
        return `

            <m-card class="btn${(isAdd) ? `Select` : `Delete`}Company" data-id="${obj.id}">
                <m-flex data-type="row">
                    <m-flex data-type="col" class="n">
                        <h1>${obj.name}</h1>
                        <h2>${obj.email}</h2>
                    </m-flex>
                    <m-flex data-type="row" class="n c sQ h">
                        <i class="icon-${(isAdd) ? `create` : `delete-2`}"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-${(isAdd) ? `create` : `delete-2`}"></use></svg></i>
                    </m-flex>
                </m-flex>
            </m-card>
                
            `;
    }

    return {
        is: is,
        init: init,
        getHtmlCard: getHtmlCard
    }

})();
'use strict';

//Admin
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
    const _allowedFileExtensions = ['jpg', 'jpeg', 'png'];
    
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
            
            Template.init();
            Category.init();
            Theme.init();

            Order.init();
            Item.init();
            Page.init();
            Group.init();

        }

        return {
            init: init
        }

    })();
    
    const keyUpTimeout = 250;
    let timeZone = moment.tz.guess();
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
    const initSnapShot = function (collection, callback) {
        console.log(`initSnapShot`, collection);
        Module.snapShotCollections.push(collection);
        db.collection(collection).onSnapshot(function(snapshot) { callback(); }); //snapshot.docChanges.forEach(function(change) { callback(); });
    }
    const unsubscribeSnapShots = function (collections) {
        console.log(`unsubscribeSnapShots`, collections);
        for (let collection of collections) {
            const unsubscribe = db.collection(collection).onSnapshot(function () {});
            unsubscribe();
        }
        Module.snapShotCollections = [];
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
    const getIsValidFile = function (obj) {
        return $.inArray(obj.name.split('.').pop().toLowerCase(), _allowedFileExtensions) < 0 || /^[^<>%$]*$/.test(obj.name);
    }

    const getHtml = function () {
        return `

            <m-navigation>
                <m-flex data-type="col" class="n">
                    <m-flex data-type="col" class="n c sQ h btnOpenBody tooltip" data-label="Main" data-function="Order.getHtmlBody" tabindex="0" role="tab" aria-label="Orders">
                        <i class="icon-product"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-product"></use></svg></i>
                        <span>Orders<span>
                    </m-flex>
                    <m-flex data-type="col" class="n c sQ h btnOpenBody tooltip" data-label="Main" data-function="Item.getHtmlBody" tabindex="0" role="tab" aria-label="Items">
                        <i class="icon-bill"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-bill"></use></svg></i>
                        <span>Items<span>
                    </m-flex>
                    <m-flex data-type="col" class="n c sQ h btnOpenBody tooltip" data-label="Main" data-function="Template.getHtmlBody" tabindex="0" role="tab" aria-label="Templates">
                        <i class="icon-template"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-template"></use></svg></i>
                        <span>Templates<span>
                    </m-flex>
                    <m-flex data-type="col" class="n c sQ h btnOpenBody tooltip" data-label="Main" data-function="Settings.getHtmlBody" tabindex="0" role="tab" aria-label="Settings">
                        <i class="icon-settings"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-settings"></use></svg></i>
                        <span>Settings<span>
                    </m-flex>
                </m-flex>
                <m-flex data-type="col" class="n c sQ h tooltip" id="btnSignOut" tabindex="0" role="tab" aria-label="Sign Out">
                    <i class="icon-sign-out"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-sign-out"></use></svg></i>
                    <span>Sign Out<span>
                </m-flex>
            </m-navigation>

            <m-body aria-label="Main">
                Dashboard
            </m-body>

            `;
    }
    
    return {
        Load: Load,
        keyUpTimeout: keyUpTimeout,
        timeZone: timeZone,
        velocitySettings: velocitySettings,
        init: init,
        initSnapShot: initSnapShot,
        unsubscribeSnapShots: unsubscribeSnapShots,
        addError: addError,
        getFunctionByName: getFunctionByName,
        getIsValidFile: getIsValidFile,
        getHtml: getHtml
    }

})();

const Template = (function () {
    
    //Private --------------------------------------------------
    const _limit = 5;
    let _last;
    let _arr = [];
    
    const _get = function (page) {

        const templates = db.collection("templates")
            .orderBy("name")
            .limit(_limit);

        _arr = [];
        templates.get().then(function (documentSnapshots) {
            
            documentSnapshots.forEach(doc => {
                const data = doc.data();
                _arr.push(data);
            });
            
            _last = documentSnapshots.docs[documentSnapshots.docs.length-1];
            $(`m-body[aria-label="Main"] #lstTemplates`).remove();
            $(`m-body[aria-label="Main"] #flxTemplates`).append(Template.getHtmlBodyList(_arr));
                  
        });
        
    }

    //Public --------------------------------------------------
    let is;
    const constructor = function (themeId, number, sortOrder, isDefault, isVerified) {
        this.templateId             = Global.getNewId();
        this.themeId                = themeId;
        this.number                 = number;
        this.sortOrder              = sortOrder;
        this.isDefault              = isDefault;
        this.isVerified             = isVerified;
    }
    const init = function () {
        //Global.getHtmlInputs(new Template.constructor(Global.getNewId(), ``, 0, 1, 0, false, false));
    }
    
    const get = function (page) {
        _get(page);
    }
    
    const getHtmlModuleAdd = function () {
        return `

            <m-header aria-label="Template Add Header">
                <m-flex data-type="row" class="n c sQ h btnCloseModule">
                    <i class="icon-delete-3"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-delete-3"></use></svg></i>
                </m-flex>
            </m-header>

            <m-body aria-label="Template Add Body">

                <m-flex data-type="col" class="n pL pR">

                    <h1>Add Template</h1>
                
                </m-flex>

                <m-flex data-type="col" class="form">

                    <m-input>
                        <label for="dboTheme">Theme</label>
                        <select id="dboTheme" required>
                            <option value="">Select</option>
                        </select>
                    </m-input>

                    <m-input>
                        <label for="txtNumber">Number</label>
                        <input type="number" id="txtNumber" placeholder="Number" value="" required />
                    </m-input>

                    <m-input>
                        <label for="txtSortOrder">SortOrder</label>
                        <input type="number" id="txtSortOrder" placeholder="SortOrder" value="" required />
                    </m-input>

                    <m-input>
                        <m-flex data-type="row" class="n">
                            <label for="chkIsDefault">IsDefault</label>
                            <input type="checkbox" id="chkIsDefault" />
                        </m-flex>
                    </m-input>

                    <m-input>
                        <m-flex data-type="row" class="n">
                            <label for="chkIsVerified">IsVerified</label>
                            <input type="checkbox" id="chkIsVerified" />
                        </m-flex>
                    </m-input>

                </m-flex>

                <m-flex data-type="row" class="footer">
                    <m-button data-type="secondary" class="btnCloseModule">
                        Cancel
                    </m-button>

                    <m-button data-type="primary" id="btnAddTemplate">
                        Continue
                    </m-button>
                </m-flex>

            </m-body>
        
            `;
    }

    const getHtmlBody = function () {
        _get(1);
        return `

            <m-flex data-type="row" class="s n">

                <m-flex data-type="col" class="n w">

                    ${Category.getHtmlBody()}

                    ${Theme.getHtmlBody()}

                </m-flex>

                <m-flex data-type="col" class="w" id="flxTemplates">

                    <m-flex data-type="row" class="n pL pR">
                        <h1>Templates</h1>
                        <m-flex data-type="row" class="n c sQ secondary btnOpenModule" data-function="Template.getHtmlModuleAdd">
                            <i class="icon-plus"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-plus"></use></svg></i>
                        </m-flex>
                    </m-flex>
                
                    ${Template.getHtmlBodyList([])}

                </m-flex>

            </m-flex>

            `;
    }
    const getHtmlBodyList = function (arr) {

        let html = ``;

        for (let obj of arr)
            html += Template.getHtmlCard(obj);

        return `
            <m-flex data-type="col" class="s cards selectable" id="lstTemplates">

                ${html}

                <m-card class="load" id="btnLoadTemplates">
                    <m-flex data-type="row" class="c">
                        <h2>
                            Show More
                        </h2>
                    </m-flex>
                </m-card>

            </m-flex>
            `;
    }
    
    const getHtmlCard = function (obj) {
        return `

            <m-card class="btnOpenModule mB" data-function="Template.getHtmlModuleDetail" data-args="${obj.templateId}">
                <m-flex data-type="row" class="sC">
                    <m-flex data-type="row" class="n c sQ secondary">
                        <i class="icon-template"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-template"></use></svg></i>
                    </m-flex>
                    <m-flex data-type="col" class="n pL pR">
                        <h2>
                            ${obj.name}
                        </h2>
                        <p>
                            ${obj.description}
                        </p>
                    </m-flex>
                </m-flex>
            </m-card>

            `;
    }

    return {
        is: is,
        constructor: constructor,
        init: init,
        get: get,
        getHtmlModuleAdd: getHtmlModuleAdd,
        getHtmlBody: getHtmlBody,
        getHtmlBodyList: getHtmlBodyList,
        getHtmlCard: getHtmlCard
    }

})();
const Category = (function () {
    
    //Private ----------------------------------------------------
    let _timeout;
    const _limit = 5;
    let _limitTotal;
    let _last;
    let _arr = [];
    let _path = ``;
    let _originalFileName = ``;
    
    const _add = function () {

        try {
            
            Validation.getIsValidForm($('m-module'));
            
            const category = new Category.constructor($(`#txtName`).val(), $(`#txtNumber`).nval(), $(`#txtSortOrder`).nval(), $(`#chkIsVerified`).prop(`checked`));
            db.collection("categories")
                .doc(category.categoryId)
                .set(Object.assign({}, category))
                .then(function() {
                    Validation.done();

                    Module.closeModule();
                    Validation.notification();
                    
                }).catch(function(error) {
                    Validation.fail(error);
                });
            
        } catch (ex) {
            Validation.fail(ex);
        }

    }
    
    const _edit = function () {
        
        Category.is.name                    = $(`#txtName`).val();
        Category.is.nameToLowerCase         = $(`#txtName`).val().toLowerCase();
        Category.is.number                  = $(`#txtNumber`).nval();
        Category.is.path                    = _path;
        Category.is.originalFileName        = _originalFileName;
        Category.is.sortOrder               = $(`#txtSortOrder`).nval();
        Category.is.isVerified              = $(`#chkIsVerified`).prop(`checked`);
        
        db.collection("categories")
            .doc(Category.is.categoryId)
            .update(Object.assign({}, Category.is))
            .then(function() {
                Module.closeModule();
                Validation.notification();
            }).catch(function(error) {
                Validation.notification(2);
            });

    }
    
    const _delete = function () {
        
        Category.is.isDeleted               = true;
        
        db.collection("categories")
            .doc(Category.is.categoryId)
            .update(Object.assign({}, Category.is))
            .then(function() {
                Module.closeModuleAll();
                Validation.notification();
            }).catch(function(error) {
                Validation.notification(2);
            });

    }

    const _get = function () {

        _arr = [];
        _limitTotal = 0;
        db.collection("categories")
            .where("isDeleted", "==", false)
            .orderBy("name")
            .limit(_limit)
            .get()
            .then(function (documentSnapshots) { _getSuccess(documentSnapshots); });
        
    }
    const _getByShowMore = function () {
        
        db.collection("categories")
            .where("isDeleted", "==", false)
            .orderBy("name")
            .startAfter(_last)
            .limit(_limit)
            .get()
            .then(function (documentSnapshots) { _getSuccess(documentSnapshots); });
        
    }
    const _getSuccess = function (documentSnapshots) {
        
        documentSnapshots.forEach(doc => {
            const data = doc.data();
            _arr.push(data);
        });
        
        _limitTotal += _limit;
        _last = documentSnapshots.docs[documentSnapshots.docs.length-1];
        $(`m-body[aria-label="Main"] #lstCategories`).remove();
        $(`m-body[aria-label="Main"] #flxCategories`).append(Category.getHtmlBodyList(_arr));
                  
    }
    const _getById = function (id) {
        
        db.collection("categories")
            .doc(id)
            .get()
            .then(function(doc) {
                if (doc.exists) {
                    Category.is = doc.data();
                    $(`m-module m-body`).html(Category.getHtmlBodyDetail());
                } else {
                    Validation.notification(2);
                }
            }).catch(function(error) {
                Validation.notification(2);
            });

    }
    
    const _search = function () {
        
        clearTimeout(_timeout);
        _timeout = setTimeout(function () {
        
            const value = $(`#txtSearchCategory`).val();

            db.collection("categories")
                .where("nameToLowerCase", ">=", value.toLowerCase())
                .where("number", "==", value.toLowerCase())
                .orderBy("nameToLowerCase")
                .limit(5)
                .get()
                .then(function(querySnapshot) {
                    console.log(querySnapshot.docs);
                    _arr = Global.getArrayFromQuerySnapshot(querySnapshot);
                    console.log(_arr);
                })
                .catch(function(error) {
                    console.log("Error getting documents: ", error);
                });
            
        }, Application.keyUpTimeout);

    }

    const _upload = function (files) {
        
        const file = files[0];
        
        if (files.length == 0 || $(`#btnUploadCategory`).hasClass('disabled') || Application.getIsValidFile(file) == false) { _uploadReset(); return; }
        $(`#btnUploadCategory`).addClass('disabled');
        
        const ext = `.${file.name.split('.').pop()}`;
        const name = `${Global.getNewId()}${ext}`;
        const path = `categories/${name}`;
        const uploadTask = firebase.storage().ref(path).put(file);

        _originalFileName = file.name;
        
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
            function(snapshot) {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                $(`#barCategory span`).css(`width`, `${progress}%`);
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                }
            }, function(error) {

                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;
                    case 'storage/canceled':
                        // User canceled the upload
                        break;
                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                }

            }, function() {
                // Upload completed successfully, now we can get the download URL
                const downloadURL = uploadTask.snapshot.downloadURL;
                _path = downloadURL;
                $(`#imgCategory`).css('background-image', `url('${downloadURL}')`).velocity(`transition.fadeIn`);
                _uploadReset();
            });
        
    }
    const _uploadReset = function () {
        $(`#uplCategory`).val(``);
        $(`#btnUploadCategory`).removeClass(`disabled`);
    }

    //Public ----------------------------------------------------
    let is;
    const constructor = function (name, number, sortOrder, isVerified) {
        const user                  = firebase.auth().currentUser;
        this.categoryId             = Global.getNewId();
        this.name                   = name;
        this.nameToLowerCase        = name.toLowerCase();
        this.number                 = number;
        this.path                   = _path;
        this.originalFileName       = _originalFileName;
        this.sortOrder              = sortOrder;
        this.isVerified             = isVerified;
        this.createdDate            = moment().valueOf();
        this.createdBy              = user.uid;
        this.modifiedDate           = moment().valueOf();
        this.modifiedBy             = user.uid;
        this.isDeleted              = false;
    }
    const init = function () {
        $(document).on(`tap`, `#btnUploadCategory`, function (e) { e.stopPropagation(); e.preventDefault(); $(`#uplCategory`).click(); });
        $(document).on(`change`, `#uplCategory`, function () { _upload($(this).prop(`files`)); });
        $(document).on(`tap`, `#btnAddCategory`, function () { _add(); });
        $(document).on(`tap`, `#btnEditCategory`, function () { _edit(); });
        $(document).on(`tap`, `#btnDeleteCategory`, function () { _delete(); });
        $(document).on(`tap`, `#btnShowMoreCategory`, function () { _getByShowMore(); });
        $(document).on(`keyup`, `#txtSearchCategory`, function () { _search(); });
    }
    
    const get = function () {
        _get();
    }
    
    const getHtmlModuleAdd = function () {
        _path = ``;
        _originalFileName = ``;
        return `

            <m-header aria-label="Category Add Header">
                <m-flex data-type="row" class="n c sQ h btnCloseModule">
                    <i class="icon-delete-3"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-delete-3"></use></svg></i>
                </m-flex>
            </m-header>

            <m-body aria-label="Category Add Body">

                <m-flex data-type="col" class="n pL pR">

                    <h1>Add Category</h1>
                
                </m-flex>

                <m-flex data-type="col" class="form">

                    <m-input>
                        <label for="txtName">Name</label>
                        <input type="text" id="txtName" placeholder="Name" value="" required />
                    </m-input>

                    <m-input>
                        <label for="txtNumber">Number</label>
                        <input type="number" id="txtNumber" placeholder="Number" value="" required />
                    </m-input>

                    <m-input>
                        <label for="txtSortOrder">SortOrder</label>
                        <input type="number" id="txtSortOrder" placeholder="SortOrder" value="" required />
                    </m-input>

                    <m-input>
                        <m-flex data-type="row" class="n">
                            <label for="chkIsVerified">IsVerified</label>
                            <input type="checkbox" id="chkIsVerified" />
                        </m-flex>
                    </m-input>

                    <m-button data-type="secondary" id="btnUploadCategory">
                        Upload
                    </m-button>
                    <input type="file" class="none" id="uplCategory" />

                    <m-bar class="progress" id="barCategory">
                        <span></span>
                    </m-bar>

                    <m-flex data-type="row">
                        <m-image class="circle sQ cover" id="imgCategory"></m-image>
                    </m-flex>

                </m-flex>

                <m-flex data-type="row" class="footer">
                    <m-button data-type="secondary" class="btnCloseModule">
                        Cancel
                    </m-button>

                    <m-button data-type="primary" id="btnAddCategory">
                        Add
                    </m-button>
                </m-flex>

            </m-body>
        
            `;
    }
    const getHtmlModuleDetail = function (id) {
        _getById(id);
        return `

            <m-header aria-label="Category Detail Header">
                <m-flex data-type="row" class="n">
                    <m-flex data-type="row" class="n c tab h btnOpenBody" data-label="Category Detail Body" data-function="Category.getHtmlBodyDetail">
                        <i class="icon-more-info"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-more-info"></use></svg></i>
                        <span>Information</span>
                    </m-flex>
                </m-flex>
                <m-flex data-type="row" class="n c sQ h btnCloseModule">
                    <i class="icon-delete-3"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-delete-3"></use></svg></i>
                </m-flex>
            </m-header>

            <m-body aria-label="Category Detail Body">

                <m-flex data-type="col">

                    <h1 class="loading">Loading</h1>
                
                </m-flex>

            </m-body>
        
            `;
    }

    const getHtmlBody = function () {
        Application.initSnapShot(`categories`, Category.get);
        return `

            <m-flex data-type="col" id="flxCategories">

                <m-flex data-type="row" class="n pL pR">
                    <h1>Categories</h1>
                    <m-flex data-type="row" class="n c sQ secondary btnOpenModule" data-function="Category.getHtmlModuleAdd">
                        <i class="icon-plus"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-plus"></use></svg></i>
                    </m-flex>
                </m-flex>
            
                ${Category.getHtmlBodyList([])}

            </m-flex>

            `;
    }
    const getHtmlBodyList = function (arr) {

        let html = ``;

        for (let obj of arr)
            html += Category.getHtmlCard(obj);

        return `
            <m-flex data-type="col" class="s cards selectable" id="lstCategories">

                ${html}

                ${(_arr.length >= _limitTotal) ? `
                <m-card class="load" id="btnShowMoreCategory">
                    <m-flex data-type="row" class="c">
                        <h2>
                            Show More
                        </h2>
                    </m-flex>
                </m-card>` : ``}

            </m-flex>
            `;
    }
    const getHtmlBodyDetail = function () {
        _path = Category.is.path;
        _originalFileName = Category.is.originalFileName;
        return `

            <m-flex data-type="row" class="n pL pR">

                <h1>Information</h1>
                <m-flex data-type="row" class="n c sQ secondary btnOpenModule" data-function="Module.getHtmlConfirmation" data-args="category,btnDeleteCategory">
                    <i class="icon-delete-2"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-delete-2"></use></svg></i>
                </m-flex>
            
            </m-flex>

            <m-flex data-type="col" class="form">

                <m-input>
                    <label for="txtName">Name</label>
                    <input type="text" id="txtName" placeholder="Name" value="${Category.is.name}" required />
                </m-input>
                
                <m-input>
                    <label for="txtNumber">Number</label>
                    <input type="number" id="txtNumber" placeholder="Number" value="${Category.is.number}" required />
                </m-input>
                
                <m-input>
                    <label for="txtSortOrder">Sort Order</label>
                    <input type="number" id="txtSortOrder" placeholder="Sort Order" value="${Category.is.sortOrder}" required />
                </m-input>
                
                <m-input>
                    <m-flex data-type="row" class="n">
                        <label for="chkIsVerified">IsVerified</label>
                        <input type="checkbox" id="chkIsVerified" ${(Category.is.isVerified) ? `checked` : ``} />
                    </m-flex>
                </m-input>

                <m-button data-type="secondary" id="btnUploadCategory">
                    Upload
                </m-button>
                <input type="file" class="none" id="uplCategory" />

                <m-bar class="progress" id="barCategory">
                    <span></span>
                </m-bar>

                <m-flex data-type="row">
                    <m-image class="circle sQ cover" id="imgCategory" style="background-image: url('${Category.is.path}');"></m-image>
                </m-flex>

            </m-flex>

            <m-flex data-type="row" class="footer">
                <m-button data-type="secondary" class="btnCloseModule">
                    Cancel
                </m-button>

                <m-button data-type="primary" id="btnEditCategory">
                    Save
                </m-button>
            </m-flex>

            `;
    }
    
    const getHtmlCard = function (obj) {
        return `

            <m-card class="btnOpenModule mB" data-function="Category.getHtmlModuleDetail" data-args="${obj.categoryId}">
                <m-flex data-type="row" class="sC">
                    <m-image class="icon circle" style="background-image: url('${obj.path}');">
                    </m-image>
                    <m-flex data-type="col" class="n pL pR">
                        <h2>
                            ${obj.name}
                        </h2>
                        <p>
                            ${obj.sortOrder}
                        </p>
                    </m-flex>
                </m-flex>
            </m-card>

            `;
    }

    return {
        is: is,
        constructor: constructor,
        init: init,
        get: get,
        getHtmlModuleAdd: getHtmlModuleAdd,
        getHtmlModuleDetail: getHtmlModuleDetail,
        getHtmlBody: getHtmlBody,
        getHtmlBodyList: getHtmlBodyList,
        getHtmlBodyDetail: getHtmlBodyDetail,
        getHtmlCard: getHtmlCard
    }

})();
const Theme = (function () {
    
    //Private ----------------------------------------------------
    let _timeout;
    const _limit = 5;
    let _limitTotal;
    let _last;
    let _arr = [];
    let _arrCategories = [];
    let _path = ``;
    let _originalFileName = ``;
    
    const _add = function () {

        try {
            
            Validation.getIsValidForm($('m-module'));
            
            const theme = new Theme.constructor($(`#dboCategory`).val(), $(`#txtName`).val(), $(`#txtNumber`).nval(), $(`#txtSortOrder`).nval(), $(`#chkIsVerified`).prop(`checked`));
            db.collection("themes")
                .doc(theme.themeId)
                .set(Object.assign({}, theme))
                .then(function() {
                    Validation.done();

                    Module.closeModule();
                    Validation.notification();
                    
                }).catch(function(error) {
                    Validation.fail(error);
                });
            
        } catch (ex) {
            Validation.fail(ex);
        }

    }
    
    const _edit = function () {
        
        Theme.is.categoryId             = $(`#dboCategory`).val();
        Theme.is.name                   = $(`#txtName`).val();
        Theme.is.nameToLowerCase        = $(`#txtName`).val().toLowerCase();
        Theme.is.number                 = $(`#txtNumber`).nval();
        Theme.is.path                   = _path;
        Theme.is.originalFileName       = _originalFileName;
        Theme.is.sortOrder              = $(`#txtSortOrder`).nval();
        Theme.is.isVerified             = $(`#chkIsVerified`).prop(`checked`);
        
        db.collection("themes")
            .doc(Theme.is.themeId)
            .update(Object.assign({}, Theme.is))
            .then(function() {
                Module.closeModule();
                Validation.notification();
            }).catch(function(error) {
                Validation.notification(2);
            });

    }
    
    const _delete = function () {
        
        Theme.is.isDeleted               = true;
        
        db.collection("themes")
            .doc(Theme.is.themeId)
            .update(Object.assign({}, Theme.is))
            .then(function() {
                Module.closeModuleAll();
                Validation.notification();
            }).catch(function(error) {
                Validation.notification(2);
            });

    }

    const _get = function () {

        _arr = [];
        _limitTotal = 0;
        db.collection("themes")
            .where("isDeleted", "==", false)
            .orderBy("name")
            .limit(_limit)
            .get()
            .then(function (documentSnapshots) { _getSuccess(documentSnapshots); });
        
    }
    const _getCategories = function () {
        
        if (_arrCategories.length > 0) return; 

        _arrCategories = [];
        db.collection("categories")
            .where("isDeleted", "==", false)
            .get()
            .then(function (documentSnapshots) { 
                documentSnapshots.forEach(doc => {
                    const data = doc.data();
                    _arrCategories.push({ value: data.categoryId, name: data.name });
                });
                $(`#dboCategory`).append(Global.getHtmlOptions(_arrCategories, (Theme.is) ? Theme.is.categoryId : ``));
            });
        
    }
    const _getByShowMore = function () {
        
        db.collection("themes")
            .where("isDeleted", "==", false)
            .orderBy("name")
            .startAfter(_last)
            .limit(_limit)
            .get()
            .then(function (documentSnapshots) { _getSuccess(documentSnapshots); });
        
    }
    const _getSuccess = function (documentSnapshots) {
        
        documentSnapshots.forEach(doc => {
            const data = doc.data();
            _arr.push(data);
        });
        
        _limitTotal += _limit;
        _last = documentSnapshots.docs[documentSnapshots.docs.length-1];
        $(`m-body[aria-label="Main"] #lstThemes`).remove();
        $(`m-body[aria-label="Main"] #flxThemes`).append(Theme.getHtmlBodyList(_arr));
                  
    }
    const _getById = function (id) {
        
        db.collection("themes")
            .doc(id)
            .get()
            .then(function(doc) {
                if (doc.exists) {
                    Theme.is = doc.data();
                    $(`m-module m-body`).html(Theme.getHtmlBodyDetail());
                } else {
                    Validation.notification(2);
                }
            }).catch(function(error) {
                Validation.notification(2);
            });

    }

    const _search = function () {
        
        clearTimeout(_timeout);
        _timeout = setTimeout(function () {
        
            const value = $(`#txtSearchTheme`).val();

            if (value == ``) {
                _get();
                return;
            }

            _arr = [];
            db.collection("themes")
                .where("nameToLowerCase", ">=", value.toLowerCase())
                .orderBy("nameToLowerCase")
                .limit(5)
                .get()
                .then(function(documentSnapshots) {
                    
                    documentSnapshots.forEach(doc => {
                        const data = doc.data();
                        _arr.push(data);
                    });
                    
                    $(`m-body[aria-label="Main"] #lstThemes`).remove();
                    $(`m-body[aria-label="Main"] #flxThemes`).append(Theme.getHtmlBodyList(_arr));
        
                })
                .catch(function(error) {
                    console.log("Error getting documents: ", error);
                });
            
        }, Application.keyUpTimeout);

    }

    const _upload = function (files) {
        
        const file = files[0];
        
        if (files.length == 0 || $(`#btnUploadTheme`).hasClass('disabled') || Application.getIsValidFile(file) == false) { _uploadReset(); return; }
        $(`#btnUploadTheme`).addClass('disabled');
        
        const ext = `.${file.name.split('.').pop()}`;
        const name = `${Global.getNewId()}${ext}`;
        const path = `themes/${name}`;
        const uploadTask = firebase.storage().ref(path).put(file);

        _originalFileName = file.name;
        
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
            function(snapshot) {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                $(`#barTheme span`).css(`width`, `${progress}%`);
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                }
            }, function(error) {

                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;
                    case 'storage/canceled':
                        // User canceled the upload
                        break;
                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                }

            }, function() {
                // Upload completed successfully, now we can get the download URL
                const downloadURL = uploadTask.snapshot.downloadURL;
                _path = downloadURL;
                $(`#imgTheme`).css('background-image', `url('${downloadURL}')`).velocity(`transition.fadeIn`);
                _uploadReset();
            });
        
    }
    const _uploadReset = function () {
        $(`#uplTheme`).val(``);
        $(`#btnUploadTheme`).removeClass(`disabled`);
    }

    //Public ----------------------------------------------------
    let is;
    const constructor = function (categoryId, name, number, sortOrder, isVerified) {
        const user                  = firebase.auth().currentUser;
        this.themeId                = Global.getNewId();
        this.categoryId             = categoryId;
        this.name                   = name;
        this.nameToLowerCase        = name.toLowerCase();
        this.number                 = number;
        this.path                   = _path;
        this.originalFileName       = _originalFileName;
        this.sortOrder              = sortOrder;
        this.isVerified             = isVerified;
        this.createdDate            = moment().valueOf();
        this.createdBy              = user.uid;
        this.modifiedDate           = moment().valueOf();
        this.modifiedBy             = user.uid;
        this.isDeleted              = false;
    }
    const init = function () {
        $(document).on(`tap`, `#btnUploadTheme`, function (e) { e.stopPropagation(); e.preventDefault(); $(`#uplTheme`).click(); });
        $(document).on(`change`, `#uplTheme`, function () { _upload($(this).prop(`files`)); });
        $(document).on(`tap`, `#btnAddTheme`, function () { _add(); });
        $(document).on(`tap`, `#btnEditTheme`, function () { _edit(); });
        $(document).on(`tap`, `#btnDeleteTheme`, function () { _delete(); });
        $(document).on(`tap`, `#btnShowMoreTheme`, function () { _getByShowMore(); });
        $(document).on(`keyup`, `#txtSearchTheme`, function () { _search(); });
    }
    
    const get = function () {
        _get();
    }
    
    const getHtmlModuleAdd = function () {
        _path = ``;
        _originalFileName = ``;
        _getCategories();
        return `

            <m-header aria-label="Theme Add Header">
                <m-flex data-type="row" class="n c sQ h btnCloseModule">
                    <i class="icon-delete-3"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-delete-3"></use></svg></i>
                </m-flex>
            </m-header>

            <m-body aria-label="Theme Add Body">

                <m-flex data-type="col" class="n pL pR">

                    <h1>Add Theme</h1>
                
                </m-flex>

                <m-flex data-type="col" class="form">

                    <m-input>
                        <label for="dboCategory">Category</label>
                        <select id="dboCategory" required>
                            <option value="">Select</option>
                            ${Global.getHtmlOptions(_arrCategories)}
                        </select>
                    </m-input>

                    <m-input>
                        <label for="txtName">Name</label>
                        <input type="text" id="txtName" placeholder="Name" value="" required />
                    </m-input>

                    <m-input>
                        <label for="txtNumber">Number</label>
                        <input type="number" id="txtNumber" placeholder="Number" value="" required />
                    </m-input>

                    <m-input>
                        <label for="txtSortOrder">SortOrder</label>
                        <input type="number" id="txtSortOrder" placeholder="SortOrder" value="" required />
                    </m-input>

                    <m-input>
                        <m-flex data-type="row" class="n">
                            <label for="chkIsVerified">IsVerified</label>
                            <input type="checkbox" id="chkIsVerified" />
                        </m-flex>
                    </m-input>

                    <m-button data-type="secondary" id="btnUploadTheme">
                        Upload
                    </m-button>
                    <input type="file" class="none" id="uplTheme" />

                    <m-bar class="progress" id="barTheme">
                        <span></span>
                    </m-bar>

                    <m-flex data-type="row">
                        <m-image class="circle sQ cover" id="imgTheme"></m-image>
                    </m-flex>

                </m-flex>

                <m-flex data-type="row" class="footer">
                    <m-button data-type="secondary" class="btnCloseModule">
                        Cancel
                    </m-button>

                    <m-button data-type="primary" id="btnAddTheme">
                        Add
                    </m-button>
                </m-flex>

            </m-body>
        
            `;
    }
    const getHtmlModuleDetail = function (id) {
        _getById(id);
        return `

            <m-header aria-label="Theme Detail Header">
                <m-flex data-type="row" class="n">
                    <m-flex data-type="row" class="n c tab h btnOpenBody" data-label="Theme Detail Body" data-function="Theme.getHtmlBodyDetail">
                        <i class="icon-more-info"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-more-info"></use></svg></i>
                        <span>Information</span>
                    </m-flex>
                </m-flex>
                <m-flex data-type="row" class="n c sQ h btnCloseModule">
                    <i class="icon-delete-3"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-delete-3"></use></svg></i>
                </m-flex>
            </m-header>

            <m-body aria-label="Theme Detail Body">

                <m-flex data-type="col">

                    <h1 class="loading">Loading</h1>
                
                </m-flex>

            </m-body>
        
            `;
    }

    const getHtmlBody = function () {
        Application.initSnapShot(`themes`, Theme.get);
        return `

            <m-flex data-type="col" id="flxThemes">

                <m-flex data-type="row" class="c n pL pR">

                    <h1>Themes</h1>

                    <m-input class="n pL pR">
                        <input type="text" id="txtSearchTheme" placeholder="Search" value="" required />
                    </m-input>

                    <m-flex data-type="row" class="n c sQ secondary btnOpenModule" data-function="Theme.getHtmlModuleAdd">
                        <i class="icon-plus"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-plus"></use></svg></i>
                    </m-flex>

                </m-flex>
            
                ${Theme.getHtmlBodyList([])}

            </m-flex>

            `;
    }
    const getHtmlBodyList = function (arr) {

        let html = ``;

        for (let obj of arr)
            html += Theme.getHtmlCard(obj);

        return `
            <m-flex data-type="col" class="s cards selectable" id="lstThemes">

                ${html}

                ${(_arr.length >= _limitTotal) ? `
                <m-card class="load" id="btnShowMoreTheme">
                    <m-flex data-type="row" class="c">
                        <h2>
                            Show More
                        </h2>
                    </m-flex>
                </m-card>` : ``}

            </m-flex>
            `;
    }
    const getHtmlBodyDetail = function () {
        _path = Theme.is.path;
        _originalFileName = Theme.is.originalFileName;
        _getCategories();
        return `

            <m-flex data-type="row" class="n pL pR">

                <h1>Information</h1>
                <m-flex data-type="row" class="n c sQ secondary btnOpenModule" data-function="Module.getHtmlConfirmation" data-args="theme,btnDeleteTheme">
                    <i class="icon-delete-2"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-delete-2"></use></svg></i>
                </m-flex>
            
            </m-flex>

            <m-flex data-type="col" class="form">

                <m-input>
                    <label for="dboCategory">Category</label>
                    <select id="dboCategory" required>
                        <option value="">Select</option>
                        ${Global.getHtmlOptions(_arrCategories, Theme.is.categoryId)}
                    </select>
                </m-input>

                <m-input>
                    <label for="txtName">Name</label>
                    <input type="text" id="txtName" placeholder="Name" value="${Theme.is.name}" required />
                </m-input>
                
                <m-input>
                    <label for="txtNumber">Number</label>
                    <input type="number" id="txtNumber" placeholder="Number" value="${Theme.is.number}" required />
                </m-input>
                
                <m-input>
                    <label for="txtSortOrder">Sort Order</label>
                    <input type="number" id="txtSortOrder" placeholder="Sort Order" value="${Theme.is.sortOrder}" required />
                </m-input>
                
                <m-input>
                    <m-flex data-type="row" class="n">
                        <label for="chkIsVerified">IsVerified</label>
                        <input type="checkbox" id="chkIsVerified" ${(Theme.is.isVerified) ? `checked` : ``} />
                    </m-flex>
                </m-input>

                <m-button data-type="secondary" id="btnUploadTheme">
                    Upload
                </m-button>
                <input type="file" class="none" id="uplTheme" />

                <m-bar class="progress" id="barTheme">
                    <span></span>
                </m-bar>

                <m-flex data-type="row">
                    <m-image class="circle sQ cover" id="imgTheme" style="background-image: url('${Theme.is.path}');"></m-image>
                </m-flex>

            </m-flex>

            <m-flex data-type="row" class="footer">
                <m-button data-type="secondary" class="btnCloseModule">
                    Cancel
                </m-button>

                <m-button data-type="primary" id="btnEditTheme">
                    Save
                </m-button>
            </m-flex>

            `;
    }
    
    const getHtmlCard = function (obj) {
        return `

            <m-card class="btnOpenModule mB" data-function="Theme.getHtmlModuleDetail" data-args="${obj.themeId}">
                <m-flex data-type="row" class="sC">
                    <m-image class="icon circle" style="background-image: url('${obj.path}');">
                    </m-image>
                    <m-flex data-type="col" class="n pL pR">
                        <h2>
                            ${obj.name}
                        </h2>
                        <p>
                            ${obj.sortOrder}
                        </p>
                    </m-flex>
                </m-flex>
            </m-card>

            `;
    }

    return {
        is: is,
        constructor: constructor,
        init: init,
        get: get,
        getHtmlModuleAdd: getHtmlModuleAdd,
        getHtmlModuleDetail: getHtmlModuleDetail,
        getHtmlBody: getHtmlBody,
        getHtmlBodyList: getHtmlBodyList,
        getHtmlBodyDetail: getHtmlBodyDetail,
        getHtmlCard: getHtmlCard
    }

})();

const Order = (function () {

    const _get = function () {

        db.collection("orders").where("isPending", "==", true)
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    console.log(doc.id, " => ", doc.data());
                });
            })
            .catch(function(error) {
                console.log("Error getting documents: ", error);
            });

    }

    const init = function () {

    }

    const get = function () {
        _get();
    }
    const getHtmlBody = function () {
        return ``;
    }

    return {
        init: init,
        get: get,
        getHtmlBody: getHtmlBody
    }

})();
const Item = (function () {

    //Private -----------------------------------------------------------
    const _limit = 5;
    let _last;
    let _arr = [];

    const _add = function () {

        try {
            
            Validation.getIsValidForm($('m-module'));
            
            const item = new Item.constructor($(`#txtName`).val(), $(`#txtNumber`).nval(), $(`#txtUnitPrice`).nval(), $(`#txtCostOfGoods`).nval(), $(`#txtStartingQuantity`).nval(), $(`#txtIncrementalQuantity`).nval(), $(`#txtWidth`).nval(), $(`#txtHeight`).nval(), $(`#txtBleed`).nval(), $(`#txtTrim`).nval(), $(`#txtWeight`).nval(), $(`#txtDescription`).val(), $(`#txtProductSpecifications`).val(), $(`#chkIsVerified`).prop(`checked`));
            db.collection("items")
                .doc(item.itemId)
                .set(Object.assign({}, item))
                .then(function() {
                    Validation.done();
                    console.log("Document written with ID: ");
                    Item.is = item;
                    Module.openBody(`Item Add Body`, `Page.getHtmlBody`);
                }).catch(function(error) {
                    Validation.fail(error);
                    console.error("Error adding document: ", error);
                });
            
        } catch (ex) {
            Validation.fail(ex);
        }

    }

    const _edit = function () {
        
        Item.is.name                    = $(`#txtName`).val();
        Item.is.number                  = $(`#txtNumber`).nval();
        Item.is.unitPrice               = $(`#txtUnitPrice`).nval();
        Item.is.costOfGoods             = $(`#txtCostOfGoods`).nval();
        Item.is.startingQuantity        = $(`#txtStartingQuantity`).nval();
        Item.is.incrementalQuantity     = $(`#txtIncrementalQuantity`).nval();
        Item.is.width                   = $(`#txtWidth`).nval();
        Item.is.height                  = $(`#txtHeight`).nval();
        Item.is.bleed                   = $(`#txtBleed`).nval();
        Item.is.trim                    = $(`#txtTrim`).nval();
        Item.is.weight                  = $(`#txtWeight`).nval();
        Item.is.description             = $(`#txtDescription`).val();
        Item.is.productSpecifications   = $(`#txtProductSpecifications`).val();
        Item.is.isVerified              = $(`#chkIsVerified`).prop(`checked`);

        db.collection("items")
            .doc(Item.is.itemId)
            .update(Object.assign({}, Item.is))
            .then(function() {
                console.log("Document updated: ");
                Validation.notification();
            }).catch(function(error) {
                console.error("Error updating document: ");
            });

    }

    const _get = function (page) {

        const items = db.collection("items")
            .orderBy("name")
            .limit(_limit);

        _arr = [];
        items.get().then(function (documentSnapshots) {
            
            documentSnapshots.forEach(doc => {
                const data = doc.data();
                _arr.push(data);
            });
            
            _last = documentSnapshots.docs[documentSnapshots.docs.length-1];
            $(`m-body[aria-label="Main"] .cards`).remove();
            $(`m-body[aria-label="Main"]`).append(Item.getHtmlBodyList(_arr));
                  
        });
        
    }
    const _getById = function (id) {
        
        db.collection("items")
            .doc(id)
            .get()
            .then(function(doc) {
                if (doc.exists) {
                    console.log("Document data:", doc.data());
                    Item.is = doc.data();
                    $(`m-module m-body`).html(Item.getHtmlBodyDetail());
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
            });

    }
    
    const _load = function () {
        
        const items = db.collection("items")
            .orderBy("name")
            .startAfter(_last)
            .limit(_limit);
        
        items.get().then(function (documentSnapshots) {
            
            documentSnapshots.forEach(doc => {
                const data = doc.data();
                _arr.push(data);
            });
            
            _last = documentSnapshots.docs[documentSnapshots.docs.length-1];
            $(`m-body[aria-label="Main"] .cards`).remove();
            $(`m-body[aria-label="Main"]`).append(Item.getHtmlBodyList(_arr));
                          

        });
        
    }

    //Public -----------------------------------------------------------
    let is;
    const constructor = function (name, number, unitPrice, costOfGoods, startingQuantity, incrementalQuantity, width, height, bleed, trim, weight, description, productSpecifications, isVerified) {
        this.itemId                 = Global.getNewId();
        this.name                   = name;
        this.number                 = number;
        this.unitPrice              = unitPrice;
        this.costOfGoods            = costOfGoods;
        this.startingQuantity       = startingQuantity;
        this.incrementalQuantity    = incrementalQuantity;
        this.width                  = width;
        this.height                 = height;
        this.bleed                  = bleed;
        this.trim                   = trim;
        this.weight                 = weight;
        this.description            = description;
        this.productSpecifications  = productSpecifications;
        this.isVerified             = isVerified;
        this.discounts              = [];
        this.pages                  = [];
    }
    const init = function () {
        $(document).on(`tap`, `#btnAddItem`, function () { _add(); });
        $(document).on(`tap`, `#btnEditItem`, function () { _edit(); });
        $(document).on(`tap`, `#btnLoadItems`, function () { _load(); });
        //Global.getHtmlInputs(new Item.constructor());
    }

    const get = function (page) {
        _get(page);
    }
    
    const getHtmlModuleAdd = function () {
        return `

            <m-header aria-label="Item Add Header">
                <m-flex data-type="row" class="n c sQ h btnCloseModule">
                    <i class="icon-delete-3"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-delete-3"></use></svg></i>
                </m-flex>
            </m-header>

            <m-body aria-label="Item Add Body">

                <m-flex data-type="col" class="n pL pR">

                    <h1>Add Item</h1>
                
                </m-flex>

                <m-flex data-type="col" class="form">

                    <m-input>
                        <label for="txtName">Name</label>
                        <input type="text" id="txtName" placeholder="Name" required />
                    </m-input>

                    <m-input>
                        <label for="txtNumber">Number</label>
                        <input type="number" id="txtNumber" placeholder="Number" required />
                    </m-input>

                    <m-flex data-type="row" class="n">

                        <m-input>
                            <label for="txtUnitPrice">UnitPrice</label>
                            <input type="number" id="txtUnitPrice" placeholder="UnitPrice" required />
                        </m-input>

                        <m-input>
                            <label for="txtCostOfGoods">CostOfGoods</label>
                            <input type="number" id="txtCostOfGoods" placeholder="CostOfGoods" required />
                        </m-input>

                    </m-flex>

                    <m-flex data-type="row" class="n">

                        <m-input>
                            <label for="txtStartingQuantity">StartingQuantity</label>
                            <input type="number" id="txtStartingQuantity" placeholder="StartingQuantity" required />
                        </m-input>

                        <m-input>
                            <label for="txtIncrementalQuantity">IncrementalQuantity</label>
                            <input type="number" id="txtIncrementalQuantity" placeholder="IncrementalQuantity" required />
                        </m-input>

                    </m-flex>

                    <m-flex data-type="row" class="n">

                        <m-input>
                            <label for="txtWidth">Width</label>
                            <input type="number" id="txtWidth" placeholder="Width" required />
                        </m-input>

                        <m-input>
                            <label for="txtHeight">Height</label>
                            <input type="number" id="txtHeight" placeholder="Height" required />
                        </m-input>

                    </m-flex>

                    <m-flex data-type="row" class="n">

                        <m-input>
                            <label for="txtBleed">Bleed</label>
                            <input type="number" id="txtBleed" placeholder="Bleed" required />
                        </m-input>

                        <m-input>
                            <label for="txtTrim">Trim</label>
                            <input type="number" id="txtTrim" placeholder="Trim" required />
                        </m-input>

                    </m-flex>

                    <m-input>
                        <label for="txtWeight">Weight</label>
                        <input type="number" id="txtWeight" placeholder="Weight" required />
                    </m-input>

                    <m-input>
                        <label for="txtDescription">Description</label>
                        <input type="text" id="txtDescription" placeholder="Description" required />
                    </m-input>

                    <m-input>
                        <label for="txtProductSpecifications">ProductSpecifications</label>
                        <input type="text" id="txtProductSpecifications" placeholder="ProductSpecifications" required />
                    </m-input>

                </m-flex>

                <m-flex data-type="row" class="footer">
                    <m-button data-type="secondary" class="btnCloseModule">
                        Cancel
                    </m-button>

                    <m-button data-type="primary" id="btnAddItem">
                        Continue
                    </m-button>
                </m-flex>

            </m-body>
        
            `;
    }
    const getHtmlModuleDetail = function (id) {
        _getById(id);
        return `

            <m-header aria-label="Item Detail Header">
                <m-flex data-type="row" class="n">
                    <m-flex data-type="row" class="n c tab h btnOpenBody" data-label="Item Detail Body" data-function="Item.getHtmlBodyDetail">
                        <i class="icon-more-info"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-more-info"></use></svg></i>
                        <span>Information</span>
                    </m-flex>
                    <m-flex data-type="row" class="n c tab h btnOpenBody" data-label="Item Detail Body" data-function="Page.getHtmlBody">
                        <i class="icon-page"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-page"></use></svg></i>
                        <span>Pages</span>
                    </m-flex>
                </m-flex>
                <m-flex data-type="row" class="n c sQ h btnCloseModule">
                    <i class="icon-delete-3"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-delete-3"></use></svg></i>
                </m-flex>
            </m-header>

            <m-body aria-label="Item Detail Body">

                <m-flex data-type="col">

                    <h1 class="loading">Loading</h1>
                
                </m-flex>

            </m-body>
        
            `;
    }

    const getHtmlBody = function () {
        _get(1);
        return `

            <m-flex data-type="col">

                <h1>Items</h1>
                <m-flex data-type="row" class="n c sQ mB secondary btnOpenModule" data-function="Item.getHtmlModuleAdd">
                    <i class="icon-plus"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-plus"></use></svg></i>
                </m-flex>
                
                ${Item.getHtmlBodyList([])}

            </m-flex>
        
            `;
    }
    const getHtmlBodyList = function (arr) {

        let html = ``;

        for (let obj of arr)
            html += Item.getHtmlCard(obj);

        return `
            <m-flex data-type="col" class="s cards selectable">

                <h2>Items</h2>

                ${html}

                <m-card class="" id="btnLoadItems">
                    <m-flex data-type="row" class="c">
                        <h2>
                            Show More
                        </h2>
                    </m-flex>
                </m-card>

            </m-flex>
            `;
    }
    const getHtmlBodyDetail = function () {
        return `

            <m-flex data-type="row" class="n pL pR">

                <h1>Information</h1>
            
            </m-flex>

            <m-flex data-type="col" class="form">

                <m-input>
                    <label for="txtName">Name</label>
                    <input type="text" id="txtName" placeholder="Name" value="${Item.is.name}" required />
                </m-input>
                
                <m-input>
                    <label for="txtNumber">Number</label>
                    <input type="number" id="txtNumber" placeholder="Number" value="${Item.is.number}" required />
                </m-input>
                
                <m-flex data-type="row" class="n">
                
                    <m-input>
                        <label for="txtUnitPrice">UnitPrice</label>
                        <input type="number" id="txtUnitPrice" placeholder="UnitPrice" value="${Item.is.unitPrice}" required />
                    </m-input>
                
                    <m-input>
                        <label for="txtCostOfGoods">CostOfGoods</label>
                        <input type="number" id="txtCostOfGoods" placeholder="CostOfGoods" value="${Item.is.costOfGoods}" required />
                    </m-input>
                
                </m-flex>
                
                <m-flex data-type="row" class="n">
                
                    <m-input>
                        <label for="txtStartingQuantity">StartingQuantity</label>
                        <input type="number" id="txtStartingQuantity" placeholder="StartingQuantity" value="${Item.is.startingQuantity}" required />
                    </m-input>
                
                    <m-input>
                        <label for="txtIncrementalQuantity">IncrementalQuantity</label>
                        <input type="number" id="txtIncrementalQuantity" placeholder="IncrementalQuantity" value="${Item.is.incrementalQuantity}" required />
                    </m-input>
                
                </m-flex>
                
                <m-flex data-type="row" class="n">
                
                    <m-input>
                        <label for="txtWidth">Width</label>
                        <input type="number" id="txtWidth" placeholder="Width" value="${Item.is.width}" required />
                    </m-input>
                
                    <m-input>
                        <label for="txtHeight">Height</label>
                        <input type="number" id="txtHeight" placeholder="Height" value="${Item.is.height}" required />
                    </m-input>
                
                </m-flex>
                
                <m-flex data-type="row" class="n">
                
                    <m-input>
                        <label for="txtBleed">Bleed</label>
                        <input type="number" id="txtBleed" placeholder="Bleed" value="${Item.is.bleed}" required />
                    </m-input>
                
                    <m-input>
                        <label for="txtTrim">Trim</label>
                        <input type="number" id="txtTrim" placeholder="Trim" value="${Item.is.trim}" required />
                    </m-input>
                
                </m-flex>
                
                <m-input>
                    <label for="txtWeight">Weight</label>
                    <input type="number" id="txtWeight" placeholder="Weight" value="${Item.is.weight}" required />
                </m-input>
                
                <m-input>
                    <label for="txtDescription">Description</label>
                    <input type="text" id="txtDescription" placeholder="Description" value="${Item.is.description}" required />
                </m-input>
                
                <m-input>
                    <label for="txtProductSpecifications">ProductSpecifications</label>
                    <input type="text" id="txtProductSpecifications" placeholder="ProductSpecifications" value="${Item.is.productSpecifications}" required />
                </m-input>
                
                <m-input>
                    <m-flex data-type="row" class="n">
                        <label for="chkIsVerified">IsVerified</label>
                        <input type="checkbox" id="chkIsVerified" ${(Item.is.isVerified) ? `checked` : ``} />
                    </m-flex>
                </m-input>

            </m-flex>

            <m-flex data-type="row" class="footer">
                <m-button data-type="secondary" class="btnCloseModule">
                    Cancel
                </m-button>

                <m-button data-type="primary" id="btnEditItem">
                    Save
                </m-button>
            </m-flex>

            `;
    }
    
    const getHtmlCard = function (obj) {
        return `

            <m-card class="btnOpenModule mB" data-function="Item.getHtmlModuleDetail" data-args="${obj.itemId}">
                <m-flex data-type="row" class="sC">
                    <m-flex data-type="row" class="n c sQ secondary">
                        <i class="icon-bill"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-bill"></use></svg></i>
                    </m-flex>
                    <m-flex data-type="col" class="n pL pR">
                        <h2>
                            ${obj.name}
                        </h2>
                        <p>
                            ${obj.description}
                        </p>
                    </m-flex>
                </m-flex>
            </m-card>

            `;
    }

    return {
        is: is,
        constructor: constructor,
        init: init,
        get: get,
        getHtmlModuleAdd: getHtmlModuleAdd,
        getHtmlModuleDetail: getHtmlModuleDetail,
        getHtmlBody: getHtmlBody,
        getHtmlBodyList: getHtmlBodyList,
        getHtmlBodyDetail: getHtmlBodyDetail,
        getHtmlCard: getHtmlCard
    }

})();
const Page = (function () {

    //Private ------------------------------------------------
    const _initSortable = function () {
        $("#lstPages").sortable({
            stop: function(e, ui) {
                
                const arr = [];
        
                $.each($('#lstPages m-card'), function (i) {
                    const id = $(this).attr(`data-id`);
                    let obj = Item.is.pages.filter(function (x) { return x.pageId == id; })[0];
                    obj.sortOrder = i + 1;
                });
        
                db.collection("items")
                    .doc(Item.is.itemId)
                    .update({
                        pages: Item.is.pages
                    })
                    .then(function() {
                        console.log("Document updated: ");
                        Validation.notification();
                    }).catch(function(error) {
                        console.error("Error adding document: ");
                    });

            }
        });
    }

    const _addToItem = function () {
        
        const page = new Page.constructor();

        page.sortOrder = Item.is.pages.length + 1;

        Item.is.pages.push(Object.assign({}, page));

        db.collection("items")
            .doc(Item.is.itemId)
            .update({
                pages: Item.is.pages
            })
            .then(function() {
                console.log("Document updated: ");
                $(`#lstPages`).append(Page.getHtmlCard(page));
            }).catch(function(error) {
                console.error("Error adding document: ");
            });

    }

    const _edit = function () {
        
        Page.is.backgroundType = $(`#dboBackgroundType`).nval();
        Page.is.align = $(`#dboAlign`).nval();
        
        db.collection("items")
            .doc(Item.is.itemId)
            .update({
                pages: Item.is.pages
            })
            .then(function() {
                console.log("Document updated: ");
                Validation.notification();
                Module.openBody(`Item Detail Body`, `Page.getHtmlBody`);
            }).catch(function(error) {
                console.error("Error adding document: ");
            });

    }

    //Public -------------------------------------------------
    const constructor = function () {
        this.pageId = Global.getNewId();
        this.canvas = {};
        this.context = {};
        this.toDataURL = ``;
        this.sortOrder = 0;
        this.backgroundType = 1;
        this.align = 1;
        this.isAutomated = false;
        this.isDeleted = false;
        this.groups = [];
        this.elements = [];
    }
    const init = function () {
        $(document).on(`tap`, `.btnAddPageToItem`, function () { _addToItem(); });
        $(document).on(`tap`, `#btnEditPage`, function () { _edit(); });
        //Global.getHtmlInputs(new Page.constructor());
    }
    
    const getHtmlBody = function () {
        return `

            <m-flex data-type="row" class="n pL pR">

                <h1>${Item.is.name} Pages</h1>
            
                <m-flex data-type="row" class="n c sQ h primary btnAddPageToItem">
                    <i class="icon-plus-math"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-plus-math"></use></svg></i>
                </m-flex>

            </m-flex>

            <m-flex data-type="col" class="form">
                ${Page.getHtmlBodyList(Item.is.pages)}
            </m-flex>

            `;
    }
    const getHtmlBodyList = function (arr) {

        let html = ``;
        
        arr = arr.sort(function(a,b) { return a.sortOrder - b.sortOrder; });
        for (let obj of arr)
            html += Page.getHtmlCard(obj);
        
        setTimeout(function () { _initSortable(); }, Application.velocitySettings.durationShort + 100);
        
        return `
            <m-flex data-type="col" class="n s cards selectable" id="lstPages">
                ${html}
            </m-flex>
            `;
    }
    const getHtmlBodyDetail = function (id) {
        Page.is = Item.is.pages.filter(function (obj) { return obj.pageId == id; })[0];
        return `

            <m-flex data-type="row" class="n pL pR">

                <h1>${Item.is.name} Page ${Page.is.sortOrder}</h1>
            
            </m-flex>

            <m-flex data-type="col">

                <m-input>
                    <label for="dboBackgroundType">BackgroundType</label>
                    <select id="dboBackgroundType" required>
                        ${Global.getHtmlOptions(listPageBackgroundTypes, Page.is.backgroundType)}
                    </select>
                </m-input>

                <m-input>
                    <label for="dboAlign">Align</label>
                    <select id="dboAlign" required>
                        ${Global.getHtmlOptions(listPageAlign, Page.is.align)}
                    </select>
                </m-input>

                <m-card class="h btnOpenBody" data-label="Item Detail Body" data-function="Group.getHtmlBody" id="">
                    <m-flex data-type="row" class="c">
                        <h2>
                            View Groups
                        </h2>
                    </m-flex>
                </m-card>

            </m-flex>

            <m-flex data-type="row" class="footer">
                <m-button data-type="secondary" class="btnOpenBody" data-label="Item Detail Body" data-function="Page.getHtmlBody">
                    Back
                </m-button>

                <m-button data-type="primary" id="btnEditPage">
                    Save
                </m-button>
            </m-flex>

            `;
    }
    const getHtmlBodyGroups = function () {
        return `

            

            `;
    }

    const getHtmlCard = function (obj) {

        let html = ``;
        
        obj.groups = obj.groups.sort(function(a,b) { return a.sortOrder - b.sortOrder; });
        for (let group of obj.groups)
            html += `${listGroupTypes[group.type - 1].name} / `;

        return `

            <m-card class="btnOpenBody mB" data-label="Item Detail Body" data-function="Page.getHtmlBodyDetail" data-args="${obj.pageId}" data-id="${obj.pageId}">
                <m-flex data-type="row" class="">
                    <m-flex data-type="row" class="n">
                        <m-flex data-type="row" class="n c sQ secondary">
                            <i class="icon-page"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-page"></use></svg></i>
                        </m-flex>
                        <m-flex data-type="col" class="n pL pR">
                            <p>
                                Page ${obj.sortOrder}
                            </p>
                            <h2>
                                ${html}
                            </h2>
                        </m-flex>
                    </m-flex>
                    <m-flex data-type="row" class="n c sQ btnEditGroupSortOrder">
                        <i class="icon-drag-reorder"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-drag-reorder"></use></svg></i>
                    </m-flex>
                </m-flex>
            </m-card>

            `;
    }

    return {
        constructor: constructor,
        init: init,
        getHtmlBody: getHtmlBody,
        getHtmlBodyList: getHtmlBodyList,
        getHtmlBodyDetail: getHtmlBodyDetail,
        getHtmlCard: getHtmlCard
    }

})();
const Group = (function () {
    
    //Private ----------------------------------------------
    const _initSortable = function () {
        $("#lstGroups").sortable({
            stop: function(e, ui) {
                
                const arr = [];
        
                $.each($('#lstGroups m-card'), function (i) {
                    const id = $(this).attr(`data-id`);
                    let obj = Page.is.groups.filter(function (x) { return x.groupId == id; })[0];
                    obj.sortOrder = i + 1;
                });
        
                db.collection("items")
                    .doc(Item.is.itemId)
                    .update({
                        pages: Item.is.pages
                    })
                    .then(function() {
                        console.log("Document updated: ");
                        Validation.notification();
                    }).catch(function(error) {
                        console.error("Error adding document: ");
                    });

            }
        });
    }

    const _addToPage = function () {
        
        const group = new Group.constructor();

        group.sortOrder = Page.is.groups.length + 1;

        Page.is.groups.push(Object.assign({}, group));

        db.collection("items")
            .doc(Item.is.itemId)
            .update({
                pages: Item.is.pages
            })
            .then(function() {
                console.log("Document updated: ");
                $(`#lstGroups`).append(Group.getHtmlCard(group));
            }).catch(function(error) {
                console.error("Error adding document: ");
            });

    }
    
    const _edit = function () {
        
        Group.is.sortOrder      = $(`#txtSortOrder`).nval();
        Group.is.type           = $(`#dboGroupType`).val();
        Group.is.eventType      = $(`#dboEventType`).val();
        Group.is.isEvent        = (Group.is.type == 1) ? true : false;
        
        db.collection("items")
            .doc(Item.is.itemId)
            .update({
                pages: Item.is.pages
            })
            .then(function() {
                console.log("Document updated: ");
                Module.openBody(`Item Detail Body`, `Group.getHtmlBody`);
            }).catch(function(error) {
                console.error("Error adding document: ");
            });

    }

    //Public ----------------------------------------------
    let is;
    const constructor = function () {
        this.groupId = Global.getNewId();
        this.type = 1;
        this.eventType = 1;
        this.sortOrder = 0;
        this.isEvent = false;
        this.isDeleted = false;
    }
    const init = function () {
        $(document).on(`tap`, `.btnAddGroupToPage`, function () { _addToPage(); });
        $(document).on(`tap`, `#btnEditGroup`, function () { _edit(); });
        $(document).on(`change`, `#dboGroupType`, function () { if ($(this).val() == 1) { $(`#inpEventType`).removeClass(`none`) } else { $(`#inpEventType`).addClass(`none`); } });
        //Global.getHtmlInputs(new Group.constructor());
    }

    const getHtmlBody = function () {
        return `

            <m-flex data-type="row" class="n pL pR">

                <h1>${Item.is.name} Page ${Page.is.sortOrder} Groups</h1>
            
                <m-flex data-type="row" class="n c sQ h primary btnAddGroupToPage">
                    <i class="icon-plus-math"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-plus-math"></use></svg></i>
                </m-flex>

            </m-flex>

            ${Group.getHtmlBodyList(Page.is.groups)}

            <m-flex data-type="row" class="footer">
                <m-button data-type="secondary" class="btnOpenBody" data-label="Item Detail Body" data-function="Page.getHtmlBodyDetail" data-args="${Page.is.pageId}">
                    Back
                </m-button>
            </m-flex>

            `;
    }
    const getHtmlBodyList = function (arr) {

        let html = ``;
        
        arr = arr.sort(function(a,b) { return a.sortOrder - b.sortOrder; });
        for (let obj of arr)
            html += Group.getHtmlCard(obj);
        
        setTimeout(function () { _initSortable(); }, Application.velocitySettings.durationShort + 100);
        
        return `
            <m-flex data-type="col" class="s cards selectable" id="lstGroups">
                ${html}
            </m-flex>
            `;
    }
    
    const getHtmlBodyDetail = function (id) {
        Group.is = Page.is.groups.filter(function (obj) { return obj.groupId == id; })[0];
        return `

            <m-flex data-type="row" class="n pL pR">

                <h1>${Item.is.name} Page ${Page.is.sortOrder} Group</h1>
            
            </m-flex>

            <m-flex data-type="col">

                <m-input>
                    <label for="dboGroupType">Type</label>
                    <select id="dboGroupType" required>
                        ${Global.getHtmlOptions(listGroupTypes, Group.is.type)}
                    </select>
                </m-input>

                <m-input class="${(parseInt(Group.is.type) != 1) ? `none` : ``}" id="inpEventType">
                    <label for="dboEventType">EventType</label>
                    <select id="dboEventType" required>
                        ${Global.getHtmlOptions(listGroupEventTypes, Group.is.eventType)}
                    </select>
                </m-input>

            </m-flex>

            <m-flex data-type="row" class="footer">
                <m-button data-type="secondary" class="btnOpenBody" data-label="Item Detail Body" data-function="Group.getHtmlBody">
                    Back
                </m-button>

                <m-button data-type="primary" id="btnEditGroup">
                    Save
                </m-button>
            </m-flex>

            `;
    }

    const getHtmlCard = function (obj) {
        return `

            <m-card class="btnOpenBody mB" data-label="Item Detail Body" data-function="Group.getHtmlBodyDetail" data-args="${obj.groupId}" data-id="${obj.groupId}">
                <m-flex data-type="row" class="">
                    <m-flex data-type="row" class="n">
                        <m-flex data-type="row" class="n c sQ secondary">
                            <i class="icon-group-objects"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-group-objects"></use></svg></i>
                        </m-flex>
                        <m-flex data-type="col" class="n pL pR">
                            <p>
                                ${listGroupTypes[obj.type - 1].name}
                            </p>
                            <h2>
                                ${(obj.isEvent) ? listGroupEventTypes[obj.eventType - 1].name : ``}
                            </h2>
                        </m-flex>
                    </m-flex>
                    <m-flex data-type="row" class="n c sQ btnEditGroupSortOrder">
                        <i class="icon-drag-reorder"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-drag-reorder"></use></svg></i>
                    </m-flex>
                </m-flex>
            </m-card>

            `;
    }

    return {
        is: is,
        constructor: constructor,
        init: init,
        getHtmlBody: getHtmlBody,
        getHtmlBodyList: getHtmlBodyList,
        getHtmlBodyDetail: getHtmlBodyDetail,
        getHtmlCard: getHtmlCard
    }

})();
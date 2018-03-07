`use strict`;

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
            
            AutomateCanvas.start(Order.is);
            AutomateCanvas.init();

            Application.init();
            Module.init();

            SignIn.init();
            SignUp.init();
            ForgotPassword.init();
            Order.init();
            Item.init();
            Element.init();
            Company.init();
            
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
    const getArrayFromQuerySnapshot = function (querySnapshot) {
        let arr = [];
        querySnapshot.forEach(function(doc) {
            let obj = doc.data();
            obj["id"] = doc.id;
            arr.push(obj);
        });
        return arr;
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
        getArrayFromQuerySnapshot: getArrayFromQuerySnapshot,
        getHtml: getHtml
    }

})();
const Module = (function () {
    
    //Private ----------------------------------------------------------
    let _historyLeft = [];
    let _historyRight = [];
    
    const _openModuleComplete = function (f = ``, args = ``, position = `left`, c = ``) {
        
        const transition = (position == `left`) ? `transition.slideLeftIn` : `transition.slideRightIn`;

        if (position == `left`)
            _historyLeft.push({ f: f, args: args }); 
        else
            _historyRight.push({ f: f, args: args }); 
        
        $(`m-module[data-position="${position}"]`).attr(`class`, c).html(Application.getFunctionByName(f, args)).velocity(transition, Application.velocitySettings.options);
        
    }
    const _closeModuleComplete = function (position) {

        if ((position == `left` && _historyLeft.length == 0) || (position == `right` && _historyRight.length == 0)) {
            $(`m-module[data-position="${position}"]`).remove();
            return;
        }
        
        const transition = (position == `left`) ? `transition.slideLeftIn` : `transition.slideRightIn`;
        const obj = (position == `left`) ? _historyLeft[_historyLeft.length - 1] : _historyRight[_historyRight.length - 1];

        $(`m-module[data-position="${position}"]`).html(Application.getFunctionByName(obj.f, obj.args)).velocity(transition, Application.velocitySettings.options);

    }

    //Public ----------------------------------------------------------
    const init = function () {
        $(document).on(`tap`, `.btnCloseModule`, function () { Module.closeModule($(this).attr(`data-position`)); });
        $(document).on(`tap`, `.btnOpenModule`, function () { Module.openModule($(this).attr(`data-function`), $(this).attr(`data-args`), $(this).attr(`data-position`), $(this).parents(`m-module`).length == 0); });
        $(document).on(`tap`, `.btnEditCard`, function (e) { e.preventDefault(); e.stopImmediatePropagation(); Module.editCard($(this), $(this).attr(`data-function`), $(this).attr(`data-args`)); });
        $(document).on(`tap`, `.btnReplaceCard`, function (e) { e.preventDefault(); e.stopImmediatePropagation(); Module.replaceCard($(this).attr(`data-label`), $(this).attr(`data-function`), $(this).attr(`data-args`)); });
    }
    
    const openModule = function (f = ``, args = ``, position = `left`, isReset = false, c = ``) {
        
        const transition = (position == `left`) ? `transition.slideLeftOut` : `transition.slideRightOut`;

        if (isReset && position == `left`)
            _historyLeft = [];
        else if (isReset && position == `right`)
            _historyRight = [];

        if ($(`m-module[data-position="${position}"]`).length == 0) {
            $(`body`).prepend(`<m-module data-position="${position}"></m-module>`);
            _openModuleComplete(f, args, position, c);
        } else {
            $(`m-module[data-position="${position}"]`).velocity(`stop`).velocity(transition, {
                duration: Application.velocitySettings.durationShort, 
                easing: Application.velocitySettings.easing,
                display: `flex`,
                complete: function () { _openModuleComplete(f, args, position, c); }
            });
        }

    }

    const editCard = function ($this, f, args) {
        const $el = $this.parentsUntil(`m-card`).parent();
        $el.velocity(`stop`).velocity('transition.slideRightOut', {
            duration: Application.velocitySettings.durationShort, 
            easing: Application.velocitySettings.easing,
            display: `flex`,
            complete: function () {
                $el.html(Application.getFunctionByName(f, args)).velocity('transition.slideLeftIn', Application.velocitySettings.optionsFlex);
                $(`m-tooltip`).remove();
            }
        });
    }
    const replaceCard = function (label, f, args) {
        $(`m-card[aria-label="${label}"]`).velocity('transition.slideRightOut', {
            duration: Application.velocitySettings.durationShort, 
            easing: Application.velocitySettings.easing,
            complete: function () {
                const $el = $(Application.getFunctionByName(f, {}));
                $(`m-card[aria-label="${label}"]`).replaceWith($el);
                $el.velocity('transition.slideLeftIn', Application.velocitySettings.options);
            }
        });
    }

    const closeModule = function (position = `left`) {
        
        const transition = (position == `left`) ? `transition.slideLeftOut` : `transition.slideRightOut`;

        if (position == `left`)
            _historyLeft.splice(_historyLeft.length - 1, 1); 
        else
            _historyRight.splice(_historyRight.length - 1, 1); 
        
        $(`m-module[data-position="${position}"]`).velocity(`stop`).velocity(transition, {
            duration: Application.velocitySettings.durationShort, 
            easing: Application.velocitySettings.easing,
            display: `none`,
            complete: function () { _closeModuleComplete(position); }
        });

    }

    return {
        init: init,
        openModule: openModule,
        editCard: editCard,
        replaceCard: replaceCard,
        closeModule: closeModule
    }

})();

const SignIn = (function () {
    
    //Private ----------------------------------------------------------
    
    const _signIn = function () {

        const vm = {
            email: $(`#txtEmail`).val(),
            password: $(`#txtPassword`).val()
        }
        
        try {
        
            Validation.getIsValidForm($(`m-card`)); //pass in parent element
        
            firebase.auth().signInWithEmailAndPassword(vm.email, vm.password)
                .then(function(data) {
                    Validation.done();
                }).catch(function(error) {
                    Validation.fail(error);
                    var errorCode = error.code;
                    var errorMessage = error.message;
                });
            
        } catch (ex) {
            Validation.fail(ex);
        }
        
    }

    //Public ----------------------------------------------------------
    let email = ``;
    const init = function () {
        $(document).on(`tap`, `#btnSignIn`, function () { _signIn(); });
        $(document).on(`keyup`, `#txtEmail`, function () { SignIn.email = $(this).val(); });
    }
    
    const getHtmlCard = function () {
        return `
            
            <m-card class="d1" aria-label="Sign In" tabindex="0" role="region">
                <m-flex data-type="row" class="s">
                
                    <m-image class="icon" style="background-image: url('');">
                    </m-image>

                    <m-flex data-type="col" class="n">
                        <h1>Ciclops</h1>
                        <h2>Sign In</h2>
                    </m-flex>

                </m-flex>
                <m-flex data-type="col" class="">
                
                    <m-input>
                        <label for="txtEmail">Email</label>
                        <input type="text" id="txtEmail" placeholder="Email" required value="${SignIn.email}" />
                    </m-input>

                    <m-input>
                        <label for="txtPassword">Password</label>
                        <input type="password" id="txtPassword" placeholder="Password" required />
                    </m-input>

                    <m-a class="btnReplaceCard" data-label="Sign In" data-function="ForgotPassword.getHtmlCard" tabindex="0" role="tab" aria-label="Forgot Password">Forgot your password? Click here to reset your password</m-a>

                </m-flex>
                <m-flex data-type="row" class="footer">

                    <m-button data-type="secondary" class="btnReplaceCard" data-label="Sign In" data-function="SignUp.getHtmlCard" data-args="">
                        Sign Up
                    </m-button>
                    <m-button data-type="primary" id="btnSignIn">
                        Sign In
                    </m-button>

                </m-flex>
            </m-card>

            `;
    }

    return {
        email: email,
        init: init,
        getHtmlCard: getHtmlCard
    }

})();
const SignUp = (function () {
    
    //Private ----------------------------------------------------------
    let _t = ``;
    
    const _addUser = function (companyId, uid, email) {
        db.collection("users").doc(uid).set({
            companyId: companyId,
            firstName: ``,
            lastName: ``,
            website: ``,
            email: email,
            originalEmail: email,
            phone: ``,
            isDeleted: false
        }).then(function() {
            console.log(`User Added`);
        }).catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }
    const _addCompany = function (name, uid, email) {
        db.collection("companies").add({
            name: name,
            nameToLowerCase: name.toLowerCase(),
            email: email
        }).then(function(docRef) {
            console.log(`Company Added`);
            _addUser(docRef.id, uid, email);
        }).catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }
    
    const _signUp = function () {

        const vm = {
            email: $(`#txtEmail`).val(),
            password: $(`#txtPassword`).val(),
            companyId: Company.is.id,
            name: Company.is.name
        }
        
        try {
        
            Validation.getIsValidForm($('m-card'));
        
            if (Company.is.name == ``)
                throw `Please select a company.`;
            
            firebase.auth().createUserWithEmailAndPassword(vm.email, vm.password)
                .then(function(data) {
                    Validation.done();
                    
                    if (vm.companyId == ``) //add company
                        _addCompany(vm.name, data.uid, data.email);
                    else
                        _addUser(vm.companyId, data.uid, data.email);
                    
                    data.sendEmailVerification().catch(function(error) {
                        console.log(error);
                    });

                }).catch(function(error) {
                    Validation.fail(error);
                    var errorCode = error.code;
                    var errorMessage = error.message;
                });
            
        } catch (ex) {
            Validation.fail(ex);
            grecaptcha.reset();
        }
           
    }
    const _sendCode = function () {
        
        const vm = {
            token: _t,
        };

        try {
            
            Validation.getIsValidForm($('m-card'));
            
            Application.post('Member_GetKeyCode', vm)
                .done(function (data) {
                    Validation.done();
                    Validation.notification(`Success`, `Code sent successfully.  Please check your email.`, `success`);
                    $('m-flex.footer').remove();
                })
                .fail(function (data) {
                    Validation.fail(data);
                });
        
        } catch (ex) {
            Validation.fail(ex);
        }

    }
    const _validate = function () {
        
        const vm = {
            token: _t,
            keyCode: $("#txtCodeOne").val() + $("#txtCodeTwo").val() + $("#txtCodeThree").val() + $("#txtCodeFour").val() + $("#txtCodeFive").val()
        };

        try {
        
            Validation.getIsValidForm($('m-card'));
            
            console.log(vm);
            Application.post('Member_EditValidated', vm)
                .done(function (data) {
                    Validation.done();
                    Application.editJackSparrow(data);
                })
                .fail(function (data) {
                    Validation.fail(data);

                    $("#txtCodeOne, #txtCodeTwo, #txtCodeThree, #txtCodeFour, #txtCodeFive").val('');
                    $("#txtCodeOne").focus();
                        
                    if (data.responseJSON.Message.toLowerCase() == `token expired. please request another key code.`)
                        $('m-card').append(`
                            <m-flex data-type="row" class="footer">

                                <m-button data-type="primary" id="btnSendNewCode" tabindex="0" role="button" aria-label="Send New Code">
                                    Send New Code
                                </m-button>

                            </m-flex>`);

                });
        
        } catch (ex) {
            Validation.fail(ex);
        }
    
    }
    
    const _keyUp = function (e) {
        
        const target = e.srcElement || e.target;
        const maxLength = parseInt(target.attributes["maxlength"].value, 10);
        const myLength = target.value.length;
        
        $('m-error').remove();

        if (myLength >= maxLength) {
            
            if (target.nextElementSibling == null)
                _validate();
            else 
                target.nextElementSibling.focus();
            
        }
        else if (myLength === 0) { // Move to previous field if empty (user pressed backspace)
            
            if (target.previousElementSibling != null)
                target.previousElementSibling.focus();

        }

    }
    
    //Public ----------------------------------------------------------
    const init = function () {
        $(document).on(`tap`, `#btnSignUp`, function () { _signUp(); });
        $(document).on(`tap`, '#btnSendNewCode', function() { _sendCode(); });
        $(document).on(`keyup`, 'm-card[aria-label="Sign Up Validation"]', function(e) { _keyUp(e); });
    }
    
    const getHtmlCard = function () {
        return `

            <m-card class="d1" aria-label="Sign Up" tabindex="0" role="region">
                <m-flex data-type="row" class="s">
                
                    <m-image class="icon" style="background-image: url('');">
                    </m-image>

                    <m-flex data-type="col" class="n">
                        <h1>Ciclops</h1>
                        <h2>Sign Up</h2>
                    </m-flex>

                </m-flex>
                <m-flex data-type="col" class="">
                
                    <m-input>
                        <label for="txtEmail">Email</label>
                        <input type="text" id="txtEmail" placeholder="Email" required value="${SignIn.email}" />
                    </m-input>

                    <m-input>
                        <label for="txtPassword">Password</label>
                        <input type="password" id="txtPassword" placeholder="Password" required />
                    </m-input>

                    <m-input>
                        <label for="txtConfirmPassword">Confirm Password</label>
                        <input type="password" id="txtConfirmPassword" placeholder="Confirm Password" required />
                    </m-input>

                    <m-input>
                        <label for="txtCompany">Company</label>
                        <m-flex data-type="row" class="n">
                            <input type="text" id="txtCompany" placeholder="Company" />
                            <m-flex data-type="row" class="n c sQ h secondary">
                                <i class="icon-search"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-search"></use></svg></i>
                            </m-flex>
                        </m-flex>
                    </m-input>

                    <m-flex data-type="col" class="n cards selectable lstCompanies">
                        <h2>Selected Company</h2>
                        ${(Company.is.name != ``) ? Company.getHtmlCard(Company.is) : ``}
                    </m-flex>

                </m-flex>
                <m-flex data-type="row" class="footer">

                    <m-button data-type="secondary" class="btnReplaceCard" data-label="Sign Up" data-label="Authentication" data-function="SignIn.getHtmlCard" data-args="">
                        Cancel
                    </m-button>
                    <m-button data-type="primary" id="btnSignUp">
                        Sign Up
                    </m-button>

                </m-flex>
            </m-card>

            `;
    }
    const getHtmlCardValidate = function () {
        return `

            <m-card class="d1" tabindex="0" role="region" aria-label="Sign Up Validation">
                <m-flex data-type="row" class="sC">

                    <m-image class="icon" style="background-image: url('');">
                    </m-image>

                    <m-flex data-type="col" class="n">
                        <h1>Ciclops</h1>
                        <h2>Account Validation</h2>
                    </m-flex>

                </m-flex>
                <m-flex data-type="col">

                    <p>
                        Before you start using Ciclops, we ask that you <span style="font-weight: 800;">please verify your email</span> 
                        by opening the email that was just sent to your inbox.
                    </p>

                </m-flex>
            </m-card>

            `;
    }
    
    return {
        init: init,
        getHtmlCard: getHtmlCard,
        getHtmlCardValidate: getHtmlCardValidate
    }

})();
const ForgotPassword = (function () {

    //Private -------------------------------------
    
    const _forgotPassword = function () {
        
        const vm = {
            email: $(`#txtEmail`).val()
        };
        
        try {
        
            Validation.getIsValidForm($('m-card'));
            
            console.log(vm);
            firebase.auth().sendPasswordResetEmail(vm.email).then(function() {
                Validation.done();
                Validation.notification(`Success`, `Please check your email inbox.`, `success`);
                //Module.openCard(`SignIn.getHtmlCard`, ``);
            }).catch(function(error) {
                Validation.fail(error);
            });
            
        } catch (ex) {
            Validation.fail(ex);
        }

    }
    const _resetForgotPassword = function () {
        
        const vm = {
            email: Application.getUrlParameter('email'),
            password: $('#txtPassword').val(),
            forgotPasswordToken: Application.getUrlParameter('forgotPasswordToken')
        }
        
        try {
        
            Validation.getIsValidForm($('m-card'));
        
            Application.post('Member_EditResetPassword', vm)
                .done(function (data) {
                    Validation.done();
                    window.location.href = `${Application.baseUrl}?email=${vm.email}&success=${encodeURI(`Your password has been successfully reset.`)}`;
                })
                .fail(function (data) {
                    Validation.fail(data);
                });
            
        } catch (ex) {
            Validation.fail(ex);
        }

    }

    //Public -------------------------------------
    const init = function () {
        $(document).on(`tap`, `#btnForgotPassword`, function () { _forgotPassword(); });
        $(document).on(`tap`, `#btnResetPassword`, function() { _resetForgotPassword(); });
    }
    
    const getHtmlCard = function () {
        return `

            <m-card class="d1" tabindex="0" role="region" aria-label="Forgot Password">
                <m-flex data-type="row" class="sC">

                    <m-image class="icon" style="background-image: url('');">
                    </m-image>

                    <m-flex data-type="col" class="n">
                        <h1>Ciclops</h1>
                        <h2>Forgot Password</h2>
                    </m-flex>

                </m-flex>
                <m-flex data-type="col">

                    <m-input>
                        <label for="txtEmail">Email</label>
                        <input type="text" id="txtEmail" placeholder="Email" required value="${SignIn.email}" />
                    </m-input>

                </m-flex>
                <m-flex data-type="row" class="footer">

                    <m-button data-type="secondary" class="btnReplaceCard" data-label="Forgot Password" data-function="SignIn.getHtmlCard" tabindex="0" role="button" aria-label="Cancel">
                        Cancel
                    </m-button>
                    <m-button data-type="primary" id="btnForgotPassword" tabindex="0" role="button" aria-label="Reset Password">
                        Send Email
                    </m-button>

                </m-flex>
            </m-card>

            `;
    }
    const getHtmlCardReset = function () {
        return `

            <m-card class="d1" tabindex="0" role="region" aria-label="Reset Password">
                <m-flex data-type="row" class="sC">

                    <m-image class="icon" style="background-image: url('');">
                    </m-image>

                    <m-flex data-type="col" class="n">
                        <h1>Ciclops</h1>
                        <h2>Reset Password</h2>
                    </m-flex>

                </m-flex>
                <m-flex data-type="col">

                    <h3>${Application.getUrlParameter(`email`)}</h3>

                    <m-input>
                        <label for="txtPassword">New Password</label>
                        <input type="password" id="txtPassword" placeholder="New Password" required />
                    </m-input>

                    <m-input>
                        <label for="txtVerifyPassword">Verify New Password</label>
                        <input type="password" id="txtVerifyPassword" placeholder="Verify New Password" required />
                    </m-input>

                </m-flex>
                <m-flex data-type="row" class="footer">

                    <m-button data-type="primary" id="btnResetPassword" tabindex="0" role="button" aria-label="Reset Password">
                        Reset Password
                    </m-button>

                </m-flex>
            </m-card>

            `;
    }
    
    return {
        init: init,
        getHtmlCard: getHtmlCard,
        getHtmlCardReset: getHtmlCardReset
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
            width: 702,//648,//2430,
            height: 1026,//1890,//3726,
            bleed: 24,
            trim: 24,
            pages: [{
                pageId: ``,
                itemId: ``,
                canvas: {},
                context: {},
                toDataURL: ``,
                sortOrder: 1,
                backgroundType: 2,//1 color 2 white 3 template
                align: 2, //1 top 2 center 3 bottom
                isAutomated: true,
                isDeleted: false,
                groups: [
                {
                    groupId: ``,
                    pageId: ``,
                    type: 4, //1 Event 2 Logo 3 Name DOB DOD 4 Photo
                    eventType: 0,
                    sortOrder: 1,
                    isEvent: false,
                    isSectionExcluded: false,
                    isDeleted: false
                },
                {
                    groupId: ``,
                    pageId: ``,
                    type: 3, //1 Event 2 Logo 3 Name DOB DOD 4 Photo
                    eventType: 0,
                    sortOrder: 2,
                    isEvent: false,
                    isSectionExcluded: false,
                    isDeleted: false
                },
                //{
                //    groupId: ``,
                //    pageId: ``,
                //    type: 1, //1 Event 2 Logo 3 Name DOB DOD 4 Photo
                //    eventType: 1,
                //    sortOrder: 3,
                //    isEvent: true,
                //    isSectionExcluded: false,
                //    isDeleted: false
                //},
                //{
                //    groupId: ``,
                //    pageId: ``,
                //    type: 2, //1 Event 2 Logo 3 Name DOB DOD 4 Photo
                //    eventType: 0,
                //    sortOrder: 4,
                //    isEvent: false,
                //    isSectionExcluded: false,
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
                    _arr = Application.getArrayFromQuerySnapshot(querySnapshot);
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
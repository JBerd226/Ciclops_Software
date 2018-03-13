'use strict';

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
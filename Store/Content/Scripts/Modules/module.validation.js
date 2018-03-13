'use strict';

const Validation = (function () {
    
    let _passwords = [];
    let _errors = 0;
    let _btnHtml = ``;
    let _btn;
    let _timeout;
    
    //Private -----------------------------------------------
    const _getIsValidEmail = function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    const _getIsValidElement = function ($this) {
    
        if ($this.attr("type") == "password")
            _passwords.push({ val: $this.val(), el: $this });
    
        if ((($this.attr("type") == "text" || $this.attr("type") == "number" || $this.attr("type") == "password" || $this.attr("type") == "date" || $this.is("textarea")) && $this.val() == "")
            || ($this.attr("type") == "radio" && !$(`input[name='${$this.attr("name")}']:checked`).val()) //Radio Buttons
            || ($this.is("select") && $this.val() == 0) //Dropdown
            || ($this.attr("type") == "email" && !_getIsValidEmail($this.val()))) //Email
            Validation.addError($this);
        
    }

    //Public -----------------------------------------------
    const init = function () {
        $(document).on(`keyup change`, `.error`, function () {
            $(this).removeClass("error");
            $(this).parent().find('m-error').remove();
        });
        $(document).on(`tap`, `.btnCloseNotification`, function () { $(`m-notification`).remove(); });
    }

    const addError = function ($this) {
    
        _errors++;
    
        $this.addClass(`error`);
        $this.parent().find(`m-error`).remove();
        //$this.parent().append(`<m-error>Please fill in the ${$this.parent().find(`label`).html()} field.</m-error>`);
        $this.parent().append(`<m-error>*Required</m-error>`);

    }
    const addErrorGeneric = function (ex) {
        
        _errors++;

        Validation.notification(`Error`, ex, `error`);
        //$this.find('m-error[data-type="generic"]').remove();
        //$this.append(`<m-error data-type="generic">${ex}</m-error>`);

    }
    
    const getIsValidForm = function ($parent) {

        let error = `An error has occured.`;

        _btn = $parent.find(`m-button[data-type="primary"]`);
        _passwords = [];
        _btnHtml = (Application.ajaxInProgress) ? _btnHtml : _btn.html();
        $(`m-error`).remove();
        $(`.error`).removeClass(`error`);

        if (Application.ajaxInProgress) Validation.addErrorGeneric(`Syncing data . . .`);
        _btn.addClass("disabled").html(`<i class="icon-restart"><svg style="width: 20px;height: 20px;margin-top: 8px;fill: #FFF;"><use xlink:href="/Content/Images/Ciclops.min.svg#icon-restart"></use></svg></i>`);
    
        $.each($parent.find("input,select,textarea"), function () { if ($(this).attr("required")) _getIsValidElement($(this)); });
    
        if (_passwords.length == 2) {
            
            if (_passwords[0].val != _passwords[1].val) {
                _errors++;
                error = `Passwords don't match.`;
            } else if (_passwords[0].val.length < 8 || !/[!@#$&*]/.test(_passwords[0].val) || !/[0-9]/.test(_passwords[0].val)) {
                _errors++;
                error = `Passwords must be at least 8 characters in length and must contain at least one special character and at least one number.`;
            }

        }

        if (_errors > 0)
            throw error;
    
    }

    const done = function () {
        _btn.removeClass(`disabled`).html(_btnHtml);
        _errors = 0;
    }
    const fail = function (data) {
        console.log(data);
        console.log(Application.ajaxInProgress);

        setTimeout(function () { if (!Application.ajaxInProgress) _btn.removeClass(`disabled`).html(_btnHtml); }, 100);

        if (data) 
            Validation.addErrorGeneric(data.message);
        else
            Validation.addErrorGeneric(`Error`);

        _errors = 0;

    }
    const notification = function (type = 1, t = `Success`, m = `Document updated successfully.`, c = `success`) {
        
        if (type == 2) { t = `Error`; m = `An error has occurred.`; c = `error`; };

        $("m-notification").remove();
        $(`body`).append(`<m-notification class="${c} d3">
                <h1>
                    <span>${t}</span>
                    <i class="icon-delete-3 btnCloseNotification"><svg style="width: 20px;height: 20px;"><use xlink:href="/Content/Images/Ciclops.min.svg#icon-delete-3"></use></svg></i>
                </h1>
                <p>${m}</p>
            </m-notification>`);
        
        clearTimeout(_timeout);
        _timeout = setTimeout(function () {
            $("m-notification").remove();
        }, 5000);

    }

    return {
        init: init,
        getIsValidForm: getIsValidForm,
        addError: addError,
        addErrorGeneric: addErrorGeneric,
        done: done,
        fail: fail,
        notification: notification
    }

})();

Validation.init();
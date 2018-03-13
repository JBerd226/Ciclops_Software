'use strict';

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
    let snapShotCollections = [];
    const init = function () {
        $(document).on(`tap`, `.btnCloseModule`, function () { Module.closeModule($(this).attr(`data-position`)); });
        $(document).on(`tap`, `.btnOpenModule`, function () { Module.openModule($(this).attr(`data-function`), $(this).attr(`data-args`), $(this).attr(`data-position`), $(this).parents(`m-module`).length == 0); });
        $(document).on(`tap`, `.btnOpenBody`, function (e) { e.preventDefault(); e.stopImmediatePropagation(); Module.openBody($(this).attr(`data-label`), $(this).attr(`data-function`), $(this).attr(`data-args`)); });
        $(document).on(`tap`, `.btnEditCard`, function (e) { e.preventDefault(); e.stopImmediatePropagation(); Module.editCard($(this), $(this).attr(`data-function`), $(this).attr(`data-args`)); });
        $(document).on(`tap`, `.btnReplaceCard`, function (e) { e.preventDefault(); e.stopImmediatePropagation(); Module.replaceCard($(this).attr(`data-label`), $(this).attr(`data-function`), $(this).attr(`data-args`)); });
    }
    
    const getHtmlConfirmation = function (action, id) {
        return `

            <m-header aria-label="Confirmation Header">
                <m-flex data-type="row" class="n">
                    <m-flex data-type="row" class="n c tab h">
                        <i class="icon-more-info"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-more-info"></use></svg></i>
                        <span>Confirmation</span>
                    </m-flex>
                </m-flex>
                <m-flex data-type="row" class="n c sQ h btnCloseModule">
                    <i class="icon-delete-3"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-delete-3"></use></svg></i>
                </m-flex>
            </m-header>

            <m-body aria-label="Confirmation Body">

                <m-flex data-type="col">

                    <h1>Confirmation</h1>
                    <p>Are you sure you want to delete this ${action}?</p>
                
                </m-flex>

                <m-flex data-type="row" class="footer">
                    <m-button data-type="secondary" class="btnCloseModule">
                        No
                    </m-button>

                    <m-button data-type="primary" id="${id}">
                        Yes
                    </m-button>
                </m-flex>

            </m-body>

            `;
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
    const openBody = function (label, f = ``, args = ``) {
        Application.unsubscribeSnapShots(Module.snapShotCollections);
        setTimeout(function () { //NEED the timeout for mobile apparently moving the thing you are in causes it to simultaneously stop that animation
            $(`m-body[aria-label="${label}"]`).velocity(`stop`).velocity('transition.slideDownOut', {
                duration: Application.velocitySettings.durationShort, 
                easing: Application.velocitySettings.easing,
                display: `block`,
                complete: function () {
                    $(`m-body[aria-label="${label}"]`).html(Application.getFunctionByName(f, args)).velocity('transition.slideUpIn', Application.velocitySettings.options);
                }
            });
        }, 100);
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
    const closeModuleAll = function (position = `left`) {
        
        const transition = (position == `left`) ? `transition.slideLeftOut` : `transition.slideRightOut`;

        if (position == `left`)
            _historyLeft = []; 
        else
            _historyRight = []; 
        
        $(`m-module[data-position="${position}"]`).velocity(`stop`).velocity(transition, {
            duration: Application.velocitySettings.durationShort, 
            easing: Application.velocitySettings.easing,
            display: `none`,
            complete: function () { $(`m-module[data-position="${position}"]`).remove(); }
        });

    }

    return {
        snapShotCollections: snapShotCollections,
        init: init,
        getHtmlConfirmation: getHtmlConfirmation,
        openModule: openModule,
        openBody: openBody,
        editCard: editCard,
        replaceCard: replaceCard,
        closeModule: closeModule,
        closeModuleAll: closeModuleAll
    }

})();
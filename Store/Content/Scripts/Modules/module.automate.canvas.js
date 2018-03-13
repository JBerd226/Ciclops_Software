`use strict`;

const AutomateCanvas = (function () {

    //Private ------------------------------------------------
    let _page = 1;
    let _index = 0;
    let _snapPoints = [];
    const constructorElement = function (isType, type, level, width, height, sortOrder, text, item, order) {

        const fontFamily = (level >= 3) ? order.company.fontHeader : ((level >= 1) ? order.company.fontSubHeader : order.company.fontBody);
        const arr = getFontSizes(item.width, item.height,  [fontFamily], level);
        const obj = arr[0];
        
        this.elementId = Global.getNewId();
        this.pageId = ``;
        this.groupId = ``;
        this.fileId = ``;
        this.context = {};
        this.type = type;
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
        this.marginTop = 0;
        this.marginBottom = (isType == 0 && level == 0) ? obj.fontSize : 0;//obj.fontSize / 2;//5 / (Math.abs(level) + 1);//obj.fontSize * 2;
        this.voidShape =    0; //0 rectangle 1 oval
        this.voidWidth =    (isType == 1 && type == 3) ? width : 0;
        this.voidHeight =   (isType == 1 && type == 3) ? height : 0;
        this.voidX =        0;
        this.voidY =        0;
        this.voidRadius =   (isType == 1 && type == 3) ? 25 : 0;
        this.sortOrder = sortOrder;
        this.opacity = 1;
        this.text = text;
        this.path = ``;
        this.originalFileName = ``;
        this.img;
        this.fillColor = (isType == 2 && type == 1) ? `#00AEEF` : `#FFF`;
        this.font = fontFamily;
        this.fontAlign = `center`;
        this.fontColor = `#000`;
        this.fontSize = obj.fontSize;
        this.fontLineHeight = 0;
        this.isText = (isType == 0) ? true : false;
        this.isItalic = false;
        this.isBold = false;
        this.isImage = (isType == 1) ? true : false;
        this.isShape = (isType == 2) ? true : false;
        this.isDraggable = true;
        this.isSelectable = true;
        this.isSizeable = true;
        this.isDeletable = true;
        this.isDeleted = false;

    }
    const _groupArr = [{
        name: `Event`,
        type: 1, 
        elements: function (group, item, order) { return _getEventElements(group, item, order); } 
    },{
        name: `Logo`,
        type: 2, 
        elements: function (group, item, order) { return [
                new constructorElement(1, 4, 0, 240, 135, 2, ``, item, order)
            ]; 
        } 
    },{
        name: `Name DOB DOD`,
        type: 3, 
        elements: function (group, item, order) { return [
                new constructorElement(0, 0, 4, 0, 0, 2, `Name Here`, item, order),
                new constructorElement(0, 0, 0, 0, 0, 2, `January 1, 1901 - December 31, 2100`, item, order)
            ];
        }
    },{
        name: `Photo`,
        type: 4, 
        elements: function (group, item, order) { return [
                new constructorElement(1, 3, 0, 0, 0, 2, ``, item, order)
            ]; 
        } 
    }];
    let _zoom = .5;
    let _snapTolerance = 10;
    
    const _initDraggable = function (element, page, item) {
        
        const $el = $(`img[data-id="${element.elementId}"]`);
        const $handle = $(`m-handle[data-id="${element.elementId}"]`);
        const oldMouseStart = $.ui.draggable.prototype._mouseStart;
        let click = {
            x: 0,
            y: 0
        };

        $.ui.draggable.prototype._mouseStart = function (event, overrideHandle, noActivation) {
            this._trigger("beforeStart", event, this._uiHash());
            oldMouseStart.apply(this, [event, overrideHandle, noActivation]);
        };

        $handle.draggable({
            beforeStart: function () {
                _getBeforeStartDraggable(element, page, item);
            },
            start: function(event) {
                click.x = event.clientX;
                click.y = event.clientY;
            },
            cursor: "move",
            drag: function (e, ui) {
                
                const original = ui.originalPosition;
                
                ui.position = {
                    left:   (e.clientX - click.x + original.left) / _zoom,
                    top:    (e.clientY - click.y + original.top) / _zoom
                };

                $(`m-snap`).addClass(`hidden`);

                //for snapPoints isLeft true
                for (let snapPoint of _snapPoints.filter(function (obj) { return obj.isLeft; }))
                    if ((ui.position.left + _snapTolerance) > snapPoint.value && (ui.position.left - _snapTolerance) < snapPoint.value) {
                        ui.position.left = snapPoint.value;
                        _editHtmlSnaps(snapPoint, element, item);
                    }

                //for snapPoints isLeft false
                for (let snapPoint of _snapPoints.filter(function (obj) { return !obj.isLeft; }))
                    if ((ui.position.top + _snapTolerance) > snapPoint.value && (ui.position.top - _snapTolerance) < snapPoint.value) {
                        ui.position.top = snapPoint.value;
                        _editHtmlSnaps(snapPoint, element, item);
                    }

                //for left min and max
                if (ui.position.left < item.bleed)
                    ui.position.left = item.bleed;
                
                if ((ui.position.left + element.width) > (item.width - item.bleed))
                    ui.position.left = (item.width - item.bleed) - element.width;

                //for top min and max
                if (ui.position.top < item.bleed)
                    ui.position.top = item.bleed;

                if ((ui.position.top + element.height) > (item.height - item.bleed))
                    ui.position.top = (item.height - item.bleed) - element.height;
                
                $handle.css({   left: ui.position.left, top: ui.position.top });
                $el.css({       left: ui.position.left, top: ui.position.top });
                
            },
            stop: function (event, ui) {
                
                $('m-snap').addClass("hidden");
                
                element.x = parseInt(ui.position.left);
                element.y = parseInt(ui.position.top);
                
                //console.log(element.x);
                //console.log(element.y);
                //_addEditDelete();

            }
        });

    }
    const _initSizeable = function (element, page, item) {
        
        const $handle = $(`m-handle[data-id="${element.elementId}"]`);
        
        $handle.resizable({
            handles: "e, w",
            containment: $(`m-canvas[data-sortOrder="${page.sortOrder}"]`),
            stop: function () {
                
                $handle.addClass("active");

                element.x = parseInt($(this).css("left").replace("px", ""));
                element.width = parseInt($(this).css("width").replace("px", ""));
                
                //console.log(element);
                //_addEditDelete();

            }
        });

    }

    const _addElements = function () {



    }

    const _editGroupsY = function (r, page, item, order) {
        
        let elements = [];
        let y = item.bleed + item.trim;
        let height = 0;

        page.groups = page.groups.sort(function(a, b){ return parseFloat(a.sortOrder) - parseFloat(b.sortOrder); });
        for (let group of page.groups) {

            const arr = _groupArr.filter(function (i) { return i.type == group.type; })[0].elements(group, item, order);
            elements = elements.concat(arr);
            
            for (let element of arr) {

                const el = (element.isText) ? _getTextAutomation(element, r, page, item, order) : _getImageAutomation(element, r, page, item, order);
                
                element.width           = el.width;
                element.height          = el.height;
                element.x               = el.x;
                element.path            = el.path;
                element.voidWidth       = el.voidWidth;
                element.voidHeight      = el.voidHeight;
                element.marginTop       = el.marginTop;
                element.marginBottom    = el.marginBottom;
                element.fontSize        = el.fontSize; 
                element.y               = y + element.marginTop;
                
                y += element.marginTop + element.height + element.marginBottom;
                height += element.marginTop + element.height + element.marginBottom;
                
            }
            
            //find current height of the group just completed and take a percentage of that group? the bigger the group the bigger the bottom margin?
            //y += 10;

        }

        return {
            height: height,
            elements: elements
        };

    }
    const _editHtmlSnaps = function (snapPoint, element, item) {

        let value = 0;
        const el = (snapPoint.isLeft) ? element.width : element.height;

        if (snapPoint.type == 0) { //Left or top
            value = snapPoint.value - item.bleed;
        } else if (snapPoint.type == 1) { //Center or middle
            value = snapPoint.value + (el / 2) - item.bleed;
        } else if (snapPoint.type == 2) { //Right or bottom
            value = snapPoint.value + el - item.bleed;
        }

        if (snapPoint.isLeft)
            $(`m-snap[data-type="left"]`).css({ left: value }).removeClass(`hidden`);
        else
            $(`m-snap[data-type="top"]`).css({ top: value }).removeClass(`hidden`);

    }
    const _editZoom = function (value) {
        _zoom = value / 100;
        $(`m-canvas`).css(`transform`, `scale(${_zoom})`);
    }

    const _getEventElements = function (group, item, order) {

        const events = order.events.filter(function (i) { return i.type == group.eventType; });
        let arr = [];

        for (let event of events) {

            if (event.name != ``) {
                arr.push(new constructorElement(0, 0, -1, 0, 0, 2, event.name, item, order));
                arr.push(new constructorElement(0, 0, 0, 0, 0, 2, event.startDate, item, order));
            }
            
            if (event.location != ``) {
                arr.push(new constructorElement(0, 0, -1, 0, 0, 2, `Final Resting Place`, item, order));
                arr.push(new constructorElement(0, 0, 0, 0, 0, 2, event.location, item, order));
            }
            
            if (event.section != ``) {
                arr.push(new constructorElement(0, 0, -1, 0, 0, 2, `Section Block Lot`, item, order));
                arr.push(new constructorElement(0, 0, 0, 0, 0, 2, event.section, item, order));
            }

        }
            
        return arr;

    }

    const _getPages = function (item, itemCallback, order) {
        
        async.each(item.pages, function(page, pageCallback) {
            console.log(`page start`);
            
            let canvas = document.createElement("canvas");

            canvas.width = item.width;
            canvas.height = item.height;
            
            page.canvas = canvas;
            page.context = canvas.getContext('2d');
            page.toDataURL = ``;
            
            if (page.isAutomated) _getGroups(page, pageCallback, item, order);
            if (!page.isAutomated) _getLoadImages(page, pageCallback, item);
            
        }, function (page, err) {
            console.log(`page done`);
            
            page.toDataURL = page.canvas.toDataURL('image/jpeg');
            //page.context.clearRect(0, 0, page.canvas.width, page.canvas.height);
            
            itemCallback();
        });

    }
    const _getGroups = function (page, pageCallback, item, order) {
        
        let obj = _editGroupsY(1, page, item, order);
        let maxHeight = item.height - ((item.bleed + item.trim) * 2);
        let diffHeight = 0;
        
        //if it is taller than take the ratio of the two heights and get the percentage that it has to be smaller across the board then redo the total heights with the new ratio
        if (obj.height > maxHeight)
            obj = _editGroupsY((maxHeight / obj.height), page, item, order);

        diffHeight = (page.align == 2) ? (maxHeight - obj.height) / 2 : maxHeight - obj.height;
        page.elements = obj.elements;

        if (page.align == 2 || page.align == 3) //center            
            for (let element of page.elements)
                element.y = element.y + diffHeight;

        //Background Shape or Image
        page.elements.push(new constructorElement(2, page.backgroundType, 0, item.width, item.height, 1, ``, item, order));
        
        _getLoadImages(page, pageCallback, item);
        
    }
    const _getLoadImages = function (page, pageCallback) {
        
        async.each(page.elements.filter(function (obj) { return obj.isImage; }), function(element, elementCallback) {
            console.log(`image start`);

            var img = new Image();

            img.crossOrigin = 'anonymous';
            img.src = element.path;
            img.onload = function(){
                element.img = img;
                elementCallback();
            };

        }, function (err) {
            console.log(`image done`);
            _getElements(page, pageCallback);
        });
        
    }
    const _getElements = function (page, pageCallback) {
        
        page.elements = page.elements.sort(function(a, b){ return parseFloat(a.sortOrder) - parseFloat(b.sortOrder); });
        for (let element of page.elements) {
            
            if (element.isText) _getText(element, page); 
            if (element.isImage) _getImage(element, page);
            if (element.isShape) _getShape(element, page);

        }
        
        pageCallback(page);

        //async.each(page.elements, function(element, elementCallback) {
        //    console.log(`element start`);
            
        //    //setTimeout(function() {
        //    //    console.log(`element something`);


        //    //    cb();
        //    //}, 1000);
        //}, function (err) {
        //    console.log(`element done`);
        //    pageCallback(page);
        //});

    }
    const _getHtmlHandle = function (element) {
        
        if (element.isImage && element.type != 4)
            return `<m-handle class="btnOpenModule" data-function="Element.getHtml" data-args="${element.elementId}" data-position="right" data-id="${element.elementId}" style="z-index: ${element.sortOrder + 100};width: ${element.width}px;height: ${element.height}px;left: ${element.x}px;top: ${element.y}px;">
                    <m-button class="primary btnInitCroppie" data-id="${element.elementId}">Edit Photo</m-button>
                </m-handle>`;
        else
            return `<m-handle class="btnOpenModule" data-function="Element.getHtml" data-args="${element.elementId}" data-position="right" data-id="${element.elementId}" style="z-index: ${element.sortOrder + 100};width: ${element.width}px;height: ${element.height}px;left: ${element.x}px;top: ${element.y}px;"></m-handle>`;

    }
    const _getBeforeStartDraggable = function (element, page, item) {
        
        const halfElementWidth = (element.width / 2) - 1;
        const halfItemWidth = item.width / 2;
        const halfElementHeight = (element.height / 2) - 1;
        const halfItemHeight = item.height / 2;
        
        _snapPoints = [];
        //always do the calculations for value by using the left most or top most
        _snapPoints.push({
            value: (halfItemWidth - halfElementWidth),// / _zoom,// - item.bleed),// / _zoom,
            type: 1, //0 left/top 1 center/middle 2 right/bottom tells me where to place snap
            isLeft: true
        });
        _snapPoints.push({
            value: (halfItemHeight - halfElementHeight),// / _zoom,// - item.bleed),// / _zoom,
            type: 1, //0 left/top 1 center/middle 2 right/bottom tells me where to place snap
            isLeft: false
        });

    }

    const _getText = function (element, page) {
        
        let canvas = document.createElement("canvas");
        let context = canvas.getContext('2d');
        const fontSize = element.fontSize;
        const textSize = _getTextFontSize(element.isBold, element.font, fontSize);
        const fontLineHeight = element.fontLineHeight;
        const lineHeight = (fontLineHeight < textSize[1]) ? textSize[1] : fontLineHeight ;
        let lines = [];
        let width = element.width;
        let fontOptions = `${(element.isItalic) ? `italic` : ``} ${(element.isBold) ? `bold` : ``} ${fontSize}pt ${element.font}`;
        let text = element.text;
        let textArray = text.split('\n');
        const x = _getTextXPosition(element);
        let y = 0;
        const pageX = _getTextXPosition(element) + element.x;
        let pageY = element.y; //1.3
        
        canvas.width = element.width;
        canvas.height = _getTextHeight(element, 1);

        page.context.textBaseline = "top";
        page.context.font = fontOptions;
        context.textBaseline = "top";
        context.font = fontOptions;

        for (let str of textArray)
            lines = lines.concat(_getTextFragmented(str, width, page.context));

        if (element.fontColor == "#000" || element.fontColor == "#FFF") element.fontColor = _getTextFontColor(element, page);
        
        page.context.fillStyle = element.fontColor;
        page.context.textAlign = element.fontAlign;
        page.context.globalAlpha = element.opacity;
        context.fillStyle = element.fontColor;
        context.textAlign = element.fontAlign;
        context.globalAlpha = element.opacity;

        lines.forEach(function (line, i) {

            page.context.fillText(line, pageX, pageY);
            pageY += lineHeight;

            context.fillText(line, x, y);
            y += lineHeight;

        });
        
        element.context = context;
        element.height = canvas.height;

        page.context.globalAlpha = 1;//I think resets context
        
    }
    const _getTextXPosition = function (element) {
        
        let x = 0;

        if (element.fontAlign == 'left')    x += 0;
        if (element.fontAlign == 'center')  x += element.width / 2;
        if (element.fontAlign == 'right')   x += element.width - 5;

        return x;
        
    }
    const _getTextFontColor = function (txt, page) {
        
        const imgs = page.elements.filter(function (obj) { return obj.isImage; });
        const img = imgs.filter(function (obj) { return txt.x > obj.x && txt.x < (obj.x + obj.width) && txt.y > obj.y && txt.y < (obj.y + obj.height); });
        
        const shps = page.elements.filter(function (obj) { return obj.isShape; });
        const shp = shps.filter(function (obj) { return txt.x > obj.x && txt.x < (obj.x + obj.width) && txt.y > obj.y && txt.y < (obj.y + obj.height); });
        
        if (img.length == 0 && shp.length == 0) return txt.fontColor;
        
        //if (img.length > 0) //console.log(img[0].FontColor);
        //CAN IMPROVE THIS
        if (img.length > 0) return img[0].fontColor;
        if (shp.length > 0) return _getTextFontColorByShapeFillColor(shp[0].fillColor);
        
    }
    const _getTextFontColorByShapeFillColor = function (hex) {
        
        var c = hex.substring(1).split('');
        let o;
        
        if (c.length == 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        
        c = '0x' + c.join('');
        o = Math.round(((parseInt((c >> 16) & 255) * 299) + (parseInt((c >> 8) & 255) * 587) + (parseInt(c & 255) * 114)) / 1000);
        
        return (o > 125) ? '#000' : '#FFF';
        
    }
    const _getTextFontSize = function (fontBold, font, fontSize) {
        
        // This global variable is used to cache repeated calls with the same arguments
        const str = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM:' + fontBold + ':' + font + ':' + fontSize;
        let div = document.createElement('DIV');
        let __measuretext_cache__;

        if (typeof (__measuretext_cache__) == 'object' && __measuretext_cache__[str])
            return __measuretext_cache__[str];

        div.innerHTML = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
        div.style.position = 'absolute';
        div.style.top = '-100px';
        div.style.left = '-100px';
        div.style.fontFamily = font;
        div.style.fontWeight = fontBold ? 'bold' : 'normal';
        div.style.fontSize = fontSize + 'pt';
        document.body.appendChild(div);

        fontSize = [div.offsetWidth, div.offsetHeight];

        document.body.removeChild(div);

        // Add the sizes to the cache as adding DOM elements is costly and can cause slow downs
        if (typeof (__measuretext_cache__) != 'object')
            __measuretext_cache__ = [];

        __measuretext_cache__[str] = fontSize;

        return fontSize;

    }
    const _getTextHeight = function (element, r) {

        let canvas = document.createElement("canvas");
        let context = canvas.getContext('2d');
        const fontSize = (element.fontSize == 0) ? 16 : (element.fontSize * r);
        const textSize = _getTextFontSize(element.isBold, element.font, fontSize);
        const fontLineHeight = element.fontLineHeight * r;
        const lineHeight = (fontLineHeight < textSize[1]) ? textSize[1] : fontLineHeight ;
        let width = (element.width == 0) ? 16 : element.width;
        let fontOptions = `${(element.isItalic) ? `italic` : ``} ${(element.isBold) ? `bold` : ``} ${fontSize}pt ${element.font}`;
        let text = element.text;
        let textArray = text.split('\n');
        let lines = [];

        context.textBaseline = "top";
        context.font = fontOptions;
        for (let str of textArray)
            lines = lines.concat(_getTextFragmented(str, width, context));
        
        return lineHeight * lines.length;

    }
    const _getTextWidth = function (obj) {

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        context.font = `${(obj.isItalic) ? `italic` : ``} ${(obj.isBold) ? `bold` : ``} ${obj.fontSize}pt ${obj.font}`;
        
        return context.measureText(obj.text).width + 50;

    }
    const _getTextFragmented = function (text, maxWidth, context) {

        let words = text.split(' ');
        let lines = [];
        let line = "";
        
        if (context.measureText(text).width < maxWidth) {
            return [text];
        }
        while (words.length > 0) {
            while (context.measureText(words[0]).width >= maxWidth) {
                var tmp = words[0];
                words[0] = tmp.slice(0, -1);
                if (words.length > 1) {
                    words[1] = tmp.slice(-1) + words[1];
                } else {
                    words.push(tmp.slice(-1));
                }
            }
            if (context.measureText(line + words[0]).width < maxWidth) {
                line += words.shift() + " ";
            } else {
                lines.push(line);
                line = "";
            }
            if (words.length === 0) {
                lines.push(line);
            }
        }
        
        return lines;

    }
    const _getTextAutomation = function (element, r, page, item, order) {
        //Leaving this function here becuase I could use it in the future for different text types or what not
        let obj = {
            width: 0,
            height: 0,
            marginTop: 0,
            marginBottom: 0,
            x: 0,
            fontSize: 0,
            path: ``
        };

        element.width = item.width - ((item.bleed + item.trim) * 2);
        
        return {
            width:          element.width,
            height:         _getTextHeight(element, r),      
            voidWidth:      0,   
            voidHeight:     0,  
            marginTop:      element.marginTop * r,   
            marginBottom:   element.marginBottom * r,
            x:              item.bleed + item.trim,
            fontSize:       element.fontSize * r,
            path:           ``
        };
        
    }
    
    const _getImage = function (element, page) {
        
        let canvas = document.createElement("canvas");
        let context = canvas.getContext('2d');
        const m = 2;
        const w = element.width;
        const h = element.height;
        const x = 0;
        const y = 0;
        const voidWidth = element.voidWidth - m;
        const voidHeight = element.voidHeight - m;
        const voidX = element.voidX + (m / 2);
        const voidY = element.voidY + (m / 2);
        const voidRadius = element.voidRadius;
        const r = voidX + voidWidth;
        const b = (voidY + voidHeight) - voidRadius;
        const pageX = element.x;
        const pageY = element.y;
        const pageVoidX = element.x + (m / 2);
        const pageVoidY = element.y + (m / 2);
        const pageR = pageVoidX + voidWidth;
        const pageB = (pageVoidY + voidHeight) - voidRadius;
        const scale = Math.min(w/element.img.width, h/element.img.height);

        canvas.width = element.width;
        canvas.height = element.height;

        if ((voidWidth > 0 && voidHeight > 0) || element.opacity != 1)
            page.context.save();

        if (voidWidth > 0 && voidHeight > 0) {
            
            page.context.beginPath();
            context.beginPath();
            
            switch (parseInt(element.voidShape)) {
                case 0:
                    //If its a rectangle-------------------------------------------------------------------
                    page.context.moveTo(pageVoidX + voidRadius, pageVoidY);
                    page.context.lineTo(pageVoidX + voidRadius, pageVoidY);
                    page.context.quadraticCurveTo(pageVoidX, pageVoidY, pageVoidX, pageVoidY + voidRadius);
                    page.context.lineTo(pageVoidX, pageB);
                    page.context.quadraticCurveTo(pageVoidX, pageB + voidRadius, pageVoidX + voidRadius, pageB + voidRadius);
                    page.context.lineTo(pageR - voidRadius, pageVoidY + voidHeight);
                    page.context.quadraticCurveTo(pageR, pageB + voidRadius, pageR, pageB);
                    page.context.lineTo(pageR, pageVoidY + voidRadius);
                    page.context.quadraticCurveTo(pageR, pageVoidY, pageR - voidRadius, pageVoidY);
                    
                    context.moveTo(voidX + voidRadius, voidY);
                    context.lineTo(voidX + voidRadius, voidY);
                    context.quadraticCurveTo(voidX, voidY, voidX, voidY + voidRadius);
                    context.lineTo(voidX, b);
                    context.quadraticCurveTo(voidX, b + voidRadius, voidX + voidRadius, b + voidRadius);
                    context.lineTo(r - voidRadius, voidY + voidHeight);
                    context.quadraticCurveTo(r, b + voidRadius, r, b);
                    context.lineTo(r, voidY + voidRadius);
                    context.quadraticCurveTo(r, voidY, r - voidRadius, voidY);
                    break;
                case 1:
                    //If its an ellipse--------------------------------------------------------------------
                    page.context.ellipse(pageVoidX + (voidWidth / 2), pageVoidY + (voidHeight / 2), voidWidth / 2, voidHeight / 2, 0, 0, 2 * Math.PI, true);
                    context.ellipse(voidX + (voidWidth / 2), voidY + (voidHeight / 2), voidWidth / 2, voidHeight / 2, 0, 0, 2 * Math.PI, true);
                    break;
                default:
                    break;
            }

            page.context.closePath();
            page.context.clip();
            context.closePath();
            context.clip();
    
        }
        
        if (element.opacity != 1)
            page.context.globalAlpha = element.opacity;
    
        if (element.type == 3) {
            _getImageCover(page.context, element.img, pageX, pageY, w, h);
            _getImageCover(context, element.img, x, y, w, h);
        } else {
            page.context.drawImage(element.img, pageX, pageY, element.img.width * scale, element.img.height * scale);
            context.drawImage(element.img, x, y, element.img.width * scale, element.img.height * scale);
        }

        element.context = context;

        if ((voidWidth > 0 && voidHeight > 0) || element.opacity != 1)
            page.context.restore();
        
    }
    const _getImageWidth = function (x) {
        //y = 503.4496 + (158.853 - 503.4496)/(1 + Math.pow((width/656.675), 4.675553))
        //y = 244.5142 + 0.0005338166*x - 3.953281e-11*x^2 created with area of width and height
        //y = 305.9649 + 0.000182001*x - 5.810163e-12*x^2 with new areas
        return 305.9649 + (0.000182001 * x) + ((5.81 * Math.pow(10, -12)) * Math.pow(x, 2));
    }
    const _getImageAutomation = function (element, r, page, item, order) {
        
        let file;
        let obj = {
            width: 0,
            height: 0,
            voidWidth: 0,
            voidHeight: 0,
            marginTop: 0,
            marginBottom: 0,
            path: ``
        };

        if (element.type == 4) { //logo
            
            file = order.files.filter(function(x) { return x.type == 5; })[0];
            obj.path = file.path;
            obj.width = element.width;
            obj.height = (element.width / file.width) * file.height;

        } else if (element.type == 3) { //hero
            
            file = order.files.filter(function(x) { return x.isPrimary; })[0];
            obj.path = file.path;

            if (page.groups.length == 1) { //Only thing on the page

                const min = Math.min(item.width, item.height);
                const isWidth = (min == item.width) ? true : false;
                const minLength = min - ((item.bleed + item.trim) * 6);
                
                obj.width = (isWidth) ? minLength : (minLength / 16) * 9;
                obj.height = (isWidth) ? (minLength / 16) * 9 : minLength;

            } else {
                
                obj.width = _getImageWidth(item.width * item.height);
                obj.height = obj.width * 1.27;

            }

            obj.voidWidth = obj.width;
            obj.voidHeight = obj.height;
            obj.marginBottom = obj.height * .1; //10% of total height guessing at this
            
        }
        
        return {
            width:          obj.width * r,
            height:         obj.height * r,      
            voidWidth:      obj.voidWidth * r,   
            voidHeight:     obj.voidHeight * r,  
            marginTop:      obj.marginTop * r,   
            marginBottom:   obj.marginBottom * r,
            x:              (item.width - (obj.width * r)) / 2,
            fontSize:       0,
            path:           obj.path
        };
        
    }
    const _getImageCover = function (context, img, x, y, w, h, offsetX, offsetY) {
        
        if (arguments.length === 2) {
            x = y = 0;
            w = context.canvas.width;
            h = context.canvas.height;
        }
        
        /// default offset is center
        offsetX = typeof offsetX === 'number' ? offsetX : 0.5;
        offsetY = typeof offsetY === 'number' ? offsetY : 0.5;
        
        /// keep bounds [0.0, 1.0]
        if (offsetX < 0) offsetX = 0;
        if (offsetY < 0) offsetY = 0;
        if (offsetX > 1) offsetX = 1;
        if (offsetY > 1) offsetY = 1;
        
        var iw = img.width,
            ih = img.height,
            r = Math.min(w / iw, h / ih),
            nw = iw * r,   /// new prop. width
            nh = ih * r,   /// new prop. height
            cx, cy, cw, ch, ar = 1;
        
        /// decide which gap to fill    
        if (nw < w) ar = w / nw;
        if (nh < h) ar = h / nh;
        nw *= ar;
        nh *= ar;
        
        /// calc source rectangle
        cw = iw / (nw / w);
        ch = ih / (nh / h);
        
        cx = (iw - cw) * offsetX;
        cy = (ih - ch) * offsetY;
        
        /// make sure source rectangle is valid
        if (cx < 0) cx = 0;
        if (cy < 0) cy = 0;
        if (cw > iw) cw = iw;
        if (ch > ih) ch = ih;
        
        /// fill image in dest. rectangle
        context.drawImage(img, cx, cy, cw, ch, x, y, w, h);

    }
    const _getImageLogoPath = function (img) {
        
        const b = Order.is.Project.Company.CompanyLogoes.filter(function (obj) { return obj.Type == 2; });
        const w = Order.is.Project.Company.CompanyLogoes.filter(function (obj) { return obj.Type == 3; });
        const shps = (OrderTemplate.isDownloading) ? OrderTemplate.is.Shapes : Template.is.Shapes;
        const shp = shps.filter(function (obj) { return obj.Page == img.Page && img.X > obj.X && img.X < (obj.X + obj.Width) && img.Y > obj.Y && img.Y < (obj.Y + obj.Height); });
        
        if (shp.length == 0 || b.length == 0 || w.length == 0) return img.Path;
        
        //if (img.length > 0) //console.log(img[0].FontColor);
        //CAN IMPROVE THIS
        if (shp.length > 0) {

            const color = TemplateText.getFontColorByShapeFillColor(shp[0].FillColor);

            //console.log(color);
            if (color == `#000`)
                return b[0].Path;
            else if (color == `#FFF`)
                return w[0].Path;

        }

    }

    const _getShape = function (element, page) {
        
        let canvas = document.createElement("canvas");
        let context = canvas.getContext('2d');
        const voidWidth = element.voidWidth;
        const voidHeight = element.voidHeight;
        const voidX = element.voidX;
        const voidY = element.voidY;
        const voidRadius = element.voidRadius;
        const r = voidX + voidWidth;
        const b = voidY + voidHeight;
        const w = element.width;
        const h = element.height;
        const pageX = element.x;
        const x = 0;
        const pageY = element.y;
        const y = 0;
        
        canvas.width = element.width;
        canvas.height = element.height;

        page.context.beginPath();
        context.beginPath();

        page.context.moveTo(pageX, pageY);
        page.context.lineTo(pageX + w, pageY);
        page.context.lineTo(pageX + w, pageY + h);
        page.context.lineTo(pageX, pageY + h);
        page.context.lineTo(pageX, pageY);
        context.moveTo(x, y);
        context.lineTo(x + w, y);
        context.lineTo(x + w, y + h);
        context.lineTo(x, y + h);
        context.lineTo(x, y);

        page.context.closePath();
        context.closePath();

        switch (element.voidShape) {
            case 0:
                //If its a rectangle-------------------------------------------------------------------
                page.context.moveTo(voidX + voidRadius, voidY);
                page.context.lineTo(voidX + voidRadius, voidY);
                page.context.quadraticCurveTo(voidX, voidY, voidX, voidY + voidRadius);
                page.context.lineTo(voidX, b);
                page.context.quadraticCurveTo(voidX, b + voidRadius, voidX + voidRadius, b + voidRadius);
                page.context.lineTo(r - voidRadius, voidY + voidHeight + voidRadius);
                page.context.quadraticCurveTo(r, b + voidRadius, r, b);
                page.context.lineTo(r, voidY + voidRadius);
                page.context.quadraticCurveTo(r, voidY, r - voidRadius, voidY);
                
                context.moveTo(voidX + voidRadius, voidY);
                context.lineTo(voidX + voidRadius, voidY);
                context.quadraticCurveTo(voidX, voidY, voidX, voidY + voidRadius);
                context.lineTo(voidX, b);
                context.quadraticCurveTo(voidX, b + voidRadius, voidX + voidRadius, b + voidRadius);
                context.lineTo(r - voidRadius, voidY + voidHeight + voidRadius);
                context.quadraticCurveTo(r, b + voidRadius, r, b);
                context.lineTo(r, voidY + voidRadius);
                context.quadraticCurveTo(r, voidY, r - voidRadius, voidY);
                break;
            case 1:
                //If its an ellipse--------------------------------------------------------------------
                page.context.ellipse(voidX, voidY, voidWidth, voidHeight, 0, 0, 2 * Math.PI, true);
                context.ellipse(voidX, voidY, voidWidth, voidHeight, 0, 0, 2 * Math.PI, true);
                break;
            default:
                break;
        }

        page.context.closePath();
        context.closePath();
        
        page.context.fillStyle = element.fillColor;
        page.context.globalAlpha = element.opacity;
        page.context.fill();
        page.context.globalAlpha = 1;
        context.fillStyle = element.fillColor;
        context.globalAlpha = element.opacity;
        context.fill();
        context.globalAlpha = 1;
        
        element.context = context;

    }

    const _reset = function () {
        _page = 1;
        _index = 0;
    }
    const _after = function () {
        console.log(`fdsa`);
    }
    
    //Public -------------------------------------------------
    const init = function () {
        $(document).on(`input`, `#rngEditZoom`, function () { console.log(`chg`); _editZoom($(`#rngEditZoom`).val()); });
    }
    
    const addToCanvas = function (element, page, item) {
        //console.log(element);
        $(`m-handle[data-id="${element.elementId}"], img[data-id="${element.elementId}"]`).remove();
        
        //if ($(`m-layers m-page.active`).attr(`data-sortOrder`) == element.page) Template.editLayerPage(element.page);
        
        if (element.isDeleted) return; //-----------------------------------------------------------------------------
        
        $(`m-canvas[data-sortOrder="${page.sortOrder}"] m-elements`).append(`<img data-id="${element.elementId}" src="${element.context.canvas.toDataURL()}" style="z-index: ${element.sortOrder};width: ${element.width}px;height: ${element.height}px;left: ${element.x}px;top: ${element.y}px;" />`);

        if (element.isSelectable)   $(`m-canvas[data-sortOrder="${page.sortOrder}"] m-handles`).append(_getHtmlHandle(element));
        if (element.isDraggable)    _initDraggable(element, page, item);
        if (element.isSizeable)     _initSizeable(element, page, item);
        
    }
    
    const getCanvas = function (order) {

        $(`m-canvas, .btnOpenModule[data-function="Item.getHtmlModuleSettings"]`).remove();
        $(`m-body[aria-label="Main"]`).append(`
                <m-flex data-type="row" class="n c sQ h secondary btnOpenModule" data-function="Item.getHtmlModuleSettings">
                    <i class="icon-settings"><svg><use xlink:href="/Content/Images/Ciclops.min.svg#icon-settings"></use></svg></i>
                </m-flex>`);

        async.each(order.items, function(item, itemCallback) {
            console.log(`item start`);
            
            async.each(item.pages, function(page, pageCallback) {
                console.log(`page start`);
            
                //console.log(page);
                $(`m-body[aria-label="Main"]`).append(`<m-canvas data-sortOrder="${page.sortOrder}" class="" style="width: ${item.width - (item.bleed + item.trim)}px;height: ${item.height - (item.bleed + item.trim)}px;">
                        <m-handles style="left: -${item.bleed}px;top: -${item.bleed}px;"></m-handles>
                        <m-elements style="left: -${item.bleed}px;top: -${item.bleed}px;"></m-elements>
                        <m-snap data-type="left" class="hidden"></m-snap>
                        <m-snap data-type="top" class="hidden"></m-snap>
                    </m-canvas>`);
                
                for (let element of page.elements)
                    AutomateCanvas.addToCanvas(element, page, item);
                
                pageCallback();
                
            }, function (err) {
                console.log(`page done`);
                itemCallback();
            });

        }, function (err) {
            console.log(`item done`);
        });
        
    }

    const start = async (order) => {
        
        async.each(order.items, function(item, itemCallback) {
            console.log(`item start`);
            _getPages(item, itemCallback, order);
        }, function (err) {
            console.log(`item done`);
            order.callback(order);
        });
        
    }
    const downloadZip = function (order) {
        
        let doc = new jsPDF('', 'pt');

        async.each(order.items, function(item, itemCallback) {
            console.log(`item start`);
            
            let zip = new JSZip();
            let w = item.width;
            let h = item.height;
            doc.deletePage(1);
            
            async.each(item.pages, function(page, pageCallback) {
                console.log(`page start`);
            
                doc.addPage(w, h);
                doc.addImage(page.toDataURL, 'JPEG', 0, 0, w, h, `page_${page.pageId}_${page.sortOrder}`, 'FAST');
            
                pageCallback();

            }, function (err) {
                console.log(`page done`);
                itemCallback();
            });

        }, function (err) {
            console.log(`item done`);
            doc.save(`${order.name}_${order.orderId}_${moment().unix()}.pdf`);
        });
        
    }
    
    return {
        init: init,
        addToCanvas: addToCanvas,
        getCanvas: getCanvas,
        start: start,
        downloadZip: downloadZip
    }

})();


































































//`use strict`;

//const Generate = (function () {

//    //Private ------------------------------------------------
//    let _page = 1;
//    let _index = 0;
//    let _canvasArr = [];
//    const constructorElement = function (isType, type, level, width, height, sortOrder, text) {

//        const fontFamily = (level >= 3) ? `Great Vibes` : ((level >= 1) ? `Lora` : `Open Sans`);
//        const arr = getFontSizes(216,  [fontFamily], level);
//        const obj = arr[0];
        
//        this.elementId = ``;
//        this.pageId = ``;
//        this.groupId = ``;
//        this.fileId = ``;
//        this.type = type;
//        this.width = width;
//        this.height = height;
//        this.x = 0;
//        this.y = 0;
//        this.marginTop = 0;
//        this.marginBottom = 5 / (Math.abs(level) + 1);//obj.fontSize * 2;
//        this.voidShape = 1; //0 rectangle 1 oval
//        this.voidWidth = 0;
//        this.voidHeight = 0;
//        this.voidX = 0;
//        this.voidY = 0;
//        this.voidRadius = 0;
//        this.sortOrder = sortOrder;
//        this.opacity = 1;
//        this.text = text;
//        this.path = ``;
//        this.originalFileName = ``;
//        this.img;
//        this.fillColor = (isType == 2 && type == 1) ? `#00AEEF` : `#FFF`;
//        this.font = fontFamily;
//        this.fontAlign = `center`;
//        this.fontColor = `#000`;
//        this.fontSize = obj.fontSize;
//        this.fontLineHeight = 0;
//        this.isText = (isType == 0) ? true : false;
//        this.isItalic = false;
//        this.isBold = false;
//        this.isImage = (isType == 1) ? true : false;
//        this.isShape = (isType == 2) ? true : false;
//        this.isDraggable = false;
//        this.isSelectable = false;
//        this.isSizeable = false;
//        this.isDeletable = false;
//        this.isDeleted = false;

//    }
//    const _groupArr = [{
//        name: `Event`,
//        type: 1, 
//        getElements: function () { _getEventElements(); } 
//    },{
//        name: `Logo`,
//        type: 2, 
//        elements: [new constructorElement(1, 4, 0, 80, 45, 2, ``)]
//    },{
//        name: `Name DOB DOD`,
//        type: 3, 
//        elements: [
//            new constructorElement(0, 0, 4, 0, 0, 2, `Name Here`),
//            new constructorElement(0, 0, 0, 0, 0, 2, `January 1, 1901 - December 31, 2100`)
//            ]
//    },{
//        name: `Photo`,
//        type: 4, 
//        elements: [new constructorElement(1, 3, 0, 0, 0, 2, ``)]
//    }];

//    const _addElements = function () {



//    }

//    const _editGroupsY = function (r, page, item, order) {
        
//        let groupElements = [];
//        let y = item.bleed + item.trim;

//        page.groups = page.groups.sort(function(a, b){ return parseFloat(a.sortOrder) - parseFloat(b.sortOrder); });
//        for (let group of page.groups) {

//            const elements = (group.isEvent) ? _getEventElements(group, order) : _groupArr.filter(function (i) { return i.type == group.type; })[0].elements;
//            groupElements = (group.isEvent) ? groupElements.concat(elements) : groupElements.concat(elements);
            
//            //somehow find a total height
//            //make sure that total height is less than max height 

//            //Or do the reverse
//            //get max height
//            for (let element of elements) {

//                let el;

//                if (element.isImage) {
//                    el = _getImageAutomation(element, r, page, item, order);
//                }
//                //if (obj.isText)
//                //    obj.width = _getTextWidth(obj);
//                element.width           = (element.isText) ? item.width - ((item.bleed + item.trim) * 2)    : el.width;
//                element.height          = (element.isText) ? _getTextHeight(element, r)                     : el.height;
//                element.x               = (element.isText) ? item.bleed + item.trim                         : (item.width - el.width) / 2;
//                element.path            = (element.isText) ? ``                                             : el.path;
//                element.marginTop       = element.marginTop * r;
//                element.marginBottom    = element.marginBottom * r;
//                element.y               = y + element.marginTop;
//                element.fontSize        = element.fontSize * r;
            
//                y += element.marginTop + element.height + element.marginBottom;

//                if (element.isImage && element.type == 3)
//                    console.log(element);

//            }
            
//            //y += 10;

//        }

//        return {
//            y: y,
//            groupElements: groupElements
//        };

//    }

//    const _getEventElements = function (group, order) {

//        const events = order.events.filter(function (i) { return i.type == group.eventType; });
//        let arr = [];

//        for (let event of events) {

//            if (event.name != ``) {
//                arr.push(new constructorElement(0, 0, -1, 0, 0, 2, event.name));
//                arr.push(new constructorElement(0, 0, 0, 0, 0, 2, event.startDate));
//            }
            
//            if (event.location != ``) {
//                arr.push(new constructorElement(0, 0, -1, 0, 0, 2, `Final Resting Place`));
//                arr.push(new constructorElement(0, 0, 0, 0, 0, 2, event.location));
//            }
            
//            if (event.section != ``) {
//                arr.push(new constructorElement(0, 0, -1, 0, 0, 2, `Section Block Lot`));
//                arr.push(new constructorElement(0, 0, 0, 0, 0, 2, event.section));
//            }

//        }
            
//        return arr;

//    }

//    const _getPages = function (item, itemCallback, order) {
        
//        async.each(item.pages, function(page, pageCallback) {
//            console.log(`page start`);
            
//            let canvas = document.createElement("canvas");

//            canvas.width = item.width * Generate.modifier;
//            canvas.height = item.height * Generate.modifier;

//            _canvasArr.push({
//                itemId: item.itemId,
//                pageId: page.pageId,
//                canvas: canvas,
//                context: canvas.getContext('2d'),
//                toDataURL: ``
//            });
            
//            if (page.isAutomated) _getGroups(page, pageCallback, item, order);
//            if (!page.isAutomated) _getLoadImages(page, pageCallback, item);
            
//        }, function (page, err) {
//            console.log(`page done`);
            
//            let canvasObj = _canvasArr.filter(function (i) { return i.pageId == page.pageId })[0];

//            //Application.editLoading(); //Shows the loading bar
//            canvasObj.toDataURL = canvasObj.canvas.toDataURL('image/jpeg');
//            //canvasObj.context.clearRect(0, 0, canvasObj.canvas.width, canvasObj.canvas.height);

//            //if (Order.isDownloading == 8 && _page == 1) { //Getting first page image for home page additional product
//            //    $(`m-option[data-id="${OrderTemplate.is.TemplateID}"] m-preview`).css(`background-image`, `url('${OrderTemplate.isImageDatas[OrderTemplate.isImageDatas.length - 1].data}')`);
//            //} else if (Order.isDownloading == 3 && _page == 1) { //Getting first page image for review page
//            //    $(`.reviewItem[data-id="${OrderTemplate.is.TemplateID}"] .proofCanvas`).css(`background-image`, `url('${OrderTemplate.isImageDatas[OrderTemplate.isImageDatas.length - 1].data}')`);
//            //    Order.getNext();
//            //} else if (Order.isDownloading == 9 && _page == 1) { //Binder
//            //    User.getNext();
//            //} else if (Order.isDownloading == 7 && _page == 1) { //Theme Page - for templates
//            //    Template.getHtml(OrderTemplate.is);
//            //    Template.getNext();
//            //} else if (Order.isDownloading == 6 && _page == 1) { //Home Page
//            //    $(`m-option[data-id="${OrderTemplate.is.TemplateID}"] m-preview`).css(`background-image`, `url('${OrderTemplate.isImageDatas[OrderTemplate.isImageDatas.length - 1].data}')`);
//            //    Order.getNext();
//            //} else if (Order.isDownloading == 2 && _page == 1) { //Labels
//            //    Order.getNext();
//            //} else if (Order.isDownloading == 4 && _page == OrderTemplate.is.Item.Pages) { //Print Preview
//            //    for (let obj of OrderTemplate.isImageDatas) $(`m-modal m-body m-items`).append(_getHtmlPrintPreviewIndividual(obj));
//            //    $(`m-modal m-items m-item:first-child`).velocity(`transition.fadeIn`, Application.velocitySettings.options);
//            //} else if (Order.isDownloading == 5 && (_page > 5 || _page == OrderTemplate.is.Item.Pages)) { //Download Proofs
//            //    OrderTemplate.downloadProof();
//            //} else if (_page != OrderTemplate.is.Item.Pages) {
//            //    _templateItemsIndex = 0;
//            //    _page++;
//            //    OrderTemplate.getNext(canvas, context);
//            //} else if (_page == OrderTemplate.is.Item.Pages && OrderTemplate.is.ItemID == 20 && _repeat) {
//            //    _templateItemsIndex = 0;
//            //    _addVideoPage(canvas, context);
//            //} else if (_page == OrderTemplate.is.Item.Pages) {
                
//            //    _repeat = true;

//            //    if (Order.isDownloading != 0)
//            //        Order.getNext();
//            //    else
//            //        _downloadZip(canvas);
//            //}

//            itemCallback();
//        });

//    }
//    const _getGroups = function (page, pageCallback, item, order) {
        
//        let obj = _editGroupsY(1, page, item, order);
//        let groupElements = obj.groupElements;
//        let y = obj.y;
//        let maxHeight = item.height - ((item.bleed + item.trim) * 2);
        
//        console.log(`---BEFORE---`);
//        console.log(maxHeight);
//        console.log(y);
//        //if it is taller than take the ratio of the two heights and get the percentage that it has to be smaller across the board then redo the total heights with the new ratio
//        if (y > maxHeight) {
//            console.log(`too tall`);
//            const r = maxHeight / y;
//            obj = _editGroupsY(r, page, item, order);
//            groupElements = obj.groupElements;
//            y = obj.y;
//        }
//        console.log(`---AFTER---`);
//        console.log(maxHeight);
//        console.log(y);
        
//        //Background Shape or Image
//        groupElements.push(new constructorElement(2, page.backgroundType, 0, item.width, item.height, 1, ``));
        
//        page.elements = groupElements;

//        _getLoadImages(page, pageCallback, item);
        
//    }
//    const _getLoadImages = function (page, pageCallback) {
        
//        async.each(page.elements.filter(function (obj) { return obj.isImage; }), function(element, elementCallback) {
//            console.log(`image start`);

//            var img = new Image();

//            img.crossOrigin = 'anonymous';
//            img.src = element.path;
//            img.onload = function(){
//                element.img = img;
//                elementCallback();
//            };

//        }, function (err) {
//            console.log(`image done`);
//            _getElements(page, pageCallback);
//        });
        
//    }
//    const _getElements = function (page, pageCallback) {
        
//        page.elements = page.elements.sort(function(a, b){ return parseFloat(a.sortOrder) - parseFloat(b.sortOrder); });
//        for (let element of page.elements) {
            
//            if (element.isText) _getText(element, page); 
//            if (element.isImage) _getImage(element, page);
//            if (element.isShape) _getShape(element, page);

//        }
        
//        pageCallback(page);

//        //async.each(page.elements, function(element, elementCallback) {
//        //    console.log(`element start`);
            
//        //    //setTimeout(function() {
//        //    //    console.log(`element something`);


//        //    //    cb();
//        //    //}, 1000);
//        //}, function (err) {
//        //    console.log(`element done`);
//        //    pageCallback(page);
//        //});

//    }

//    const _getText = function (obj, page) {

//        let canvasObj = _canvasArr.filter(function (i) { return i.pageId == page.pageId })[0];
//        const fontSize = (obj.fontSize * Generate.modifier);
//        const textSize = _getTextFontSize(obj.isBold, obj.font, fontSize);
//        const fontLineHeight = obj.fontLineHeight * Generate.modifier;
//        const lineHeight = (fontLineHeight < textSize[1]) ? textSize[1] : fontLineHeight ;
//        let lines = [];
//        let width = (obj.width * Generate.modifier);
//        let fontOptions = `${(obj.isItalic) ? `italic` : ``} ${(obj.isBold) ? `bold` : ``} ${fontSize}pt ${obj.font}`;
//        let text = obj.text;
//        let textArray = text.split('\n');
//        const x = _getTextXPosition(obj);
//        let y = (Generate.isPDF) ? ((obj.y * Generate.modifier) + 1.3) : 1.3;

//        canvasObj.context.textBaseline = "top";
//        canvasObj.context.font = fontOptions;
//        for (let str of textArray)
//            lines = lines.concat(_getTextFragmented(str, width, canvasObj.context));

//        if (obj.fontColor == "#000" || obj.fontColor == "#FFF") obj.fontColor = _getTextFontColor(obj, page);
        
//        canvasObj.context.fillStyle = obj.fontColor;
//        canvasObj.context.textAlign = obj.fontAlign;
//        canvasObj.context.globalAlpha = obj.opacity;

//        lines.forEach(function (line, i) {
//            canvasObj.context.fillText(line, x, y);
//            y += lineHeight;
//        });
        
//        canvasObj.context.globalAlpha = 1;
//        //elementCallback();

//    }
//    const _getTextXPosition = function (obj) {
        
//        let x = (Generate.isPDF) ? (obj.x * Generate.modifier) : 0;

//        if (obj.fontAlign == 'left') x += 0;
//        if (obj.fontAlign == 'center') x += (obj.width * Generate.modifier) / 2;
//        if (obj.fontAlign == 'right') x += (obj.width * Generate.modifier) - 5;

//        return x;
        
//    }
//    const _getTextFontColor = function (txt, page) {
        
//        const imgs = page.elements.filter(function (obj) { return obj.isImage; });
//        const img = imgs.filter(function (obj) { return txt.x > obj.x && txt.x < (obj.x + obj.width) && txt.y > obj.y && txt.y < (obj.y + obj.height); });
        
//        const shps = page.elements.filter(function (obj) { return obj.isShape; });
//        const shp = shps.filter(function (obj) { return txt.x > obj.x && txt.x < (obj.x + obj.width) && txt.y > obj.y && txt.y < (obj.y + obj.height); });
        
//        if (img.length == 0 && shp.length == 0) return txt.fontColor;
        
//        //if (img.length > 0) //console.log(img[0].FontColor);
//        //CAN IMPROVE THIS
//        if (img.length > 0) return img[0].fontColor;
//        if (shp.length > 0) return _getTextFontColorByShapeFillColor(shp[0].fillColor);
        
//    }
//    const _getTextFontColorByShapeFillColor = function (hex) {
        
//        var c = hex.substring(1).split('');
//        let o;
        
//        if (c.length == 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        
//        c = '0x' + c.join('');
//        o = Math.round(((parseInt((c >> 16) & 255) * 299) + (parseInt((c >> 8) & 255) * 587) + (parseInt(c & 255) * 114)) / 1000);
        
//        return (o > 125) ? '#000' : '#FFF';
        
//    }
//    const _getTextFontSize = function (fontBold, font, fontSize) {
        
//        // This global variable is used to cache repeated calls with the same arguments
//        const str = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM:' + fontBold + ':' + font + ':' + fontSize;
//        let div = document.createElement('DIV');
//        let __measuretext_cache__;

//        if (typeof (__measuretext_cache__) == 'object' && __measuretext_cache__[str])
//            return __measuretext_cache__[str];

//        div.innerHTML = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
//        div.style.position = 'absolute';
//        div.style.top = '-100px';
//        div.style.left = '-100px';
//        div.style.fontFamily = font;
//        div.style.fontWeight = fontBold ? 'bold' : 'normal';
//        div.style.fontSize = fontSize + 'pt';
//        document.body.appendChild(div);

//        fontSize = [div.offsetWidth, div.offsetHeight];

//        document.body.removeChild(div);

//        // Add the sizes to the cache as adding DOM elements is costly and can cause slow downs
//        if (typeof (__measuretext_cache__) != 'object')
//            __measuretext_cache__ = [];

//        __measuretext_cache__[str] = fontSize;

//        return fontSize;

//    }
//    const _getTextHeight = function (element, r) {

//        let canvas = document.createElement("canvas");
//        let context = canvas.getContext('2d');
//        const fontSize = (element.fontSize == 0) ? 16 : (element.fontSize * r);
//        const textSize = _getTextFontSize(element.isBold, element.font, fontSize);
//        const fontLineHeight = element.fontLineHeight * r;
//        const lineHeight = (fontLineHeight < textSize[1]) ? textSize[1] : fontLineHeight ;
//        let width = (element.width == 0) ? 16 : element.width;
//        let fontOptions = `${(element.isItalic) ? `italic` : ``} ${(element.isBold) ? `bold` : ``} ${fontSize}pt ${element.font}`;
//        let text = element.text;
//        let textArray = text.split('\n');
//        let lines = [];

//        context.textBaseline = "top";
//        context.font = fontOptions;
//        for (let str of textArray)
//            lines = lines.concat(_getTextFragmented(str, width, context));
        
//        return lineHeight * lines.length;

//    }
//    const _getTextWidth = function (obj) {

//        const canvas = document.createElement("canvas");
//        const context = canvas.getContext("2d");

//        context.font = `${(obj.isItalic) ? `italic` : ``} ${(obj.isBold) ? `bold` : ``} ${obj.fontSize}pt ${obj.font}`;
        
//        return context.measureText(obj.text).width + 50;

//    }
//    const _getTextFragmented = function (text, maxWidth, context) {

//        let words = text.split(' ');
//        let lines = [];
//        let line = "";
        
//        if (context.measureText(text).width < maxWidth) {
//            return [text];
//        }
//        while (words.length > 0) {
//            while (context.measureText(words[0]).width >= maxWidth) {
//                var tmp = words[0];
//                words[0] = tmp.slice(0, -1);
//                if (words.length > 1) {
//                    words[1] = tmp.slice(-1) + words[1];
//                } else {
//                    words.push(tmp.slice(-1));
//                }
//            }
//            if (context.measureText(line + words[0]).width < maxWidth) {
//                line += words.shift() + " ";
//            } else {
//                lines.push(line);
//                line = "";
//            }
//            if (words.length === 0) {
//                lines.push(line);
//            }
//        }
        
//        return lines;

//    }
    
//    const _getImage = function (element, page) {
        
//        let canvasObj = _canvasArr.filter(function (i) { return i.pageId == page.pageId })[0];
//        const m = 2;
//        const w = element.width * Generate.modifier;
//        const h = element.height * Generate.modifier;
//        const x = (Generate.isPDF) ? (element.x * Generate.modifier) : 0;
//        const y = (Generate.isPDF) ? (element.y * Generate.modifier) : 0;
//        const voidWidth = (element.width - m) * Generate.modifier;
//        const voidHeight = (element.height - m) * Generate.modifier;
//        const voidX = (Generate.isPDF) ? ((element.x + (m / 2)) * Generate.modifier) : ((element.voidX + (m / 2)) * Generate.modifier);
//        const voidY = (Generate.isPDF) ? ((element.y + (m / 2)) * Generate.modifier) : ((element.voidY + (m / 2)) * Generate.modifier);
//        const voidRadius = (element.width * Generate.modifier);
//        const r = voidX + voidWidth;
//        const b = (voidY + voidHeight) - voidRadius;
//        const scale = Math.min(w/element.img.width, h/element.img.height);
//        //let img = new Image();
        
//        //Need to incorporate company settings before executing this
//        //if (element.type == 4) element.path = _getImageLogoPath(element);

//        //img.crossOrigin = 'anonymous';
//        //img.src = (Generate.isPDF) ? element.path : Application.getThumbnailPath(element.path);
//        //img.width = element.img.width;
//        //img.height = element.img.height;
        
//        if ((voidWidth > 0 && voidHeight > 0) || element.opacity != 1)
//            canvasObj.context.save();

//        if (voidWidth > 0 && voidHeight > 0) {
                
//                canvasObj.context.beginPath();
                
//                switch (parseInt(element.voidShape)) {
//                    case 0:
//                        //If its a rectangle-------------------------------------------------------------------
//                        canvasObj.context.moveTo(voidX + voidRadius, voidY);
//                        canvasObj.context.lineTo(voidX + voidRadius, voidY);
//                        canvasObj.context.quadraticCurveTo(voidX, voidY, voidX, voidY + voidRadius);
//                        canvasObj.context.lineTo(voidX, b);
//                        canvasObj.context.quadraticCurveTo(voidX, b + voidRadius, voidX + voidRadius, b + voidRadius);
//                        canvasObj.context.lineTo(r - voidRadius, voidY + voidHeight);
//                        canvasObj.context.quadraticCurveTo(r, b + voidRadius, r, b);
//                        canvasObj.context.lineTo(r, voidY + voidRadius);
//                        canvasObj.context.quadraticCurveTo(r, voidY, r - voidRadius, voidY);
//                        break;
//                    case 1:
//                      //If its an ellipse--------------------------------------------------------------------
//                      canvasObj.context.ellipse(voidX + (voidWidth / 2), voidY + (voidHeight / 2), voidWidth / 2, voidHeight / 2, 0, 0, 2 * Math.PI, true);
//                        break;
//                    default:
//                        break;
//                }

//                canvasObj.context.closePath();
            
//                //context.moveTo(x, y);
//                //context.lineTo(x + w, y);
//                //context.lineTo(x + w, y + h);
//                //context.lineTo(x, y + h);
//                //context.lineTo(x, y);

//                //context.closePath();
            
//                // Clip to the current path
//                canvasObj.context.clip();
    
//            }
        
//        if (element.opacity != 1)
//            canvasObj.context.globalAlpha = element.opacity;
    
//        if (element.type == 3)
//            _getImageCover(canvasObj.context, element.img, x, y, w, h);
//        else
//            canvasObj.context.drawImage(element.img, x, y, element.img.width * scale, element.img.height * scale);
    
//        if ((voidWidth > 0 && voidHeight > 0) || element.opacity != 1)
//            canvasObj.context.restore();
        
//    }
//    const _getImageWidth = function (width) {
//        return 503.4496 + (158.853 - 503.4496)/(1 + Math.pow((width/656.675), 4.675553));
//    }
//    const _getImageAutomation = function (obj, r, page, item, order) {
        
//        let width = 0;
//        let height = 0;
//        let file;
//        let path = ``;

//        if (obj.type == 4) { //logo
            
//            width = obj.width;
//            height = obj.height;
//            file = order.files.filter(function(x) { return x.type == 5; })[0];
//            path = file.path;

//        } else if (obj.type == 3) { //hero
            
//            file = order.files.filter(function(x) { return x.isPrimary; })[0];
//            path = file.path;

//            if (page.groups.length == 1) { //Only thing on the page

//                const min = Math.min(item.width, item.height);
//                const isWidth = (min == item.width) ? true : false;
//                const minLength = min - ((item.bleed + item.trim) * 6);
                
//                width = (isWidth) ? minLength : (minLength / 16) * 9;
//                height = (isWidth) ? (minLength / 16) * 9 : minLength;

//            } else {
                
//                width = _getImageWidth(item.width);
//                height = width * 1.27;

//            }
            
//        }
        
//        return {
//            width: width * r,
//            height: height * r,
//            path: path
//        };
        
//    }
//    const _getImageCover = function (context, img, x, y, w, h, offsetX, offsetY) {
        
//        if (arguments.length === 2) {
//            x = y = 0;
//            w = context.canvas.width;
//            h = context.canvas.height;
//        }
        
//        /// default offset is center
//        offsetX = typeof offsetX === 'number' ? offsetX : 0.5;
//        offsetY = typeof offsetY === 'number' ? offsetY : 0.5;
        
//        /// keep bounds [0.0, 1.0]
//        if (offsetX < 0) offsetX = 0;
//        if (offsetY < 0) offsetY = 0;
//        if (offsetX > 1) offsetX = 1;
//        if (offsetY > 1) offsetY = 1;
        
//        var iw = img.width,
//            ih = img.height,
//            r = Math.min(w / iw, h / ih),
//            nw = iw * r,   /// new prop. width
//            nh = ih * r,   /// new prop. height
//            cx, cy, cw, ch, ar = 1;
        
//        /// decide which gap to fill    
//        if (nw < w) ar = w / nw;
//        if (nh < h) ar = h / nh;
//        nw *= ar;
//        nh *= ar;
        
//        /// calc source rectangle
//        cw = iw / (nw / w);
//        ch = ih / (nh / h);
        
//        cx = (iw - cw) * offsetX;
//        cy = (ih - ch) * offsetY;
        
//        /// make sure source rectangle is valid
//        if (cx < 0) cx = 0;
//        if (cy < 0) cy = 0;
//        if (cw > iw) cw = iw;
//        if (ch > ih) ch = ih;
        
//        /// fill image in dest. rectangle
//        context.drawImage(img, cx, cy, cw, ch, x, y, w, h);

//    }
//    const _getImageLogoPath = function (img) {
        
//        const b = Order.is.Project.Company.CompanyLogoes.filter(function (obj) { return obj.Type == 2; });
//        const w = Order.is.Project.Company.CompanyLogoes.filter(function (obj) { return obj.Type == 3; });
//        const shps = (OrderTemplate.isDownloading) ? OrderTemplate.is.Shapes : Template.is.Shapes;
//        const shp = shps.filter(function (obj) { return obj.Page == img.Page && img.X > obj.X && img.X < (obj.X + obj.Width) && img.Y > obj.Y && img.Y < (obj.Y + obj.Height); });
        
//        if (shp.length == 0 || b.length == 0 || w.length == 0) return img.Path;
        
//        //if (img.length > 0) //console.log(img[0].FontColor);
//        //CAN IMPROVE THIS
//        if (shp.length > 0) {

//            const color = TemplateText.getFontColorByShapeFillColor(shp[0].FillColor);

//            //console.log(color);
//            if (color == `#000`)
//                return b[0].Path;
//            else if (color == `#FFF`)
//                return w[0].Path;

//        }

//    }

//    const _getShape = function (element, page) {
        
//        let canvasObj = _canvasArr.filter(function (i) { return i.pageId == page.pageId })[0];
//        const voidWidth = element.voidWidth * Generate.modifier;
//        const voidHeight = element.voidHeight * Generate.modifier;
//        const voidX = element.voidX * Generate.modifier;
//        const voidY = element.voidY * Generate.modifier;
//        const voidRadius = element.voidRadius * Generate.modifier;
//        const r = voidX + voidWidth;
//        const b = voidY + voidHeight;
//        const w = element.width * Generate.modifier;
//        const h = element.height * Generate.modifier;
//        const x = (Generate.isPDF) ? (element.x * Generate.modifier) : 0;
//        const y = (Generate.isPDF) ? (element.y * Generate.modifier) : 0;

//        canvasObj.context.beginPath();

//        canvasObj.context.moveTo(x, y);
//        canvasObj.context.lineTo(x + w, y);
//        canvasObj.context.lineTo(x + w, y + h);
//        canvasObj.context.lineTo(x, y + h);
//        canvasObj.context.lineTo(x, y);

//        canvasObj.context.closePath();

//        switch (element.voidShape) {
//            case 0:
//                //If its a rectangle-------------------------------------------------------------------
//                canvasObj.context.moveTo(voidX + voidRadius, voidY);
//                canvasObj.context.lineTo(voidX + voidRadius, voidY);
//                canvasObj.context.quadraticCurveTo(voidX, voidY, voidX, voidY + voidRadius);
//                canvasObj.context.lineTo(voidX, b);
//                canvasObj.context.quadraticCurveTo(voidX, b + voidRadius, voidX + voidRadius, b + voidRadius);
//                canvasObj.context.lineTo(r - voidRadius, voidY + voidHeight + voidRadius);
//                canvasObj.context.quadraticCurveTo(r, b + voidRadius, r, b);
//                canvasObj.context.lineTo(r, voidY + voidRadius);
//                canvasObj.context.quadraticCurveTo(r, voidY, r - voidRadius, voidY);
//                break;
//            case 1:
//                //If its an ellipse--------------------------------------------------------------------
//                canvasObj.context.ellipse(voidX, voidY, voidWidth, voidHeight, 0, 0, 2 * Math.PI, true);
//                break;
//            default:
//                break;
//        }

//        canvasObj.context.closePath();
        
//        canvasObj.context.fillStyle = element.fillColor;
//        canvasObj.context.globalAlpha = element.opacity;
//        canvasObj.context.fill();
//        canvasObj.context.globalAlpha = 1;
        
//        //elementCallback();

//    }

//    const _reset = function () {
//        _page = 1;
//        _index = 0;
//    }
//    const _after = function () {
//        console.log(`fdsa`);
//    }
    
//    const _downloadZip = function (order) {
        
//        let doc = new jsPDF('', 'pt');

//        async.each(order.items, function(item, itemCallback) {
//            console.log(`item start`);
            
//            let zip = new JSZip();
//            let w = item.width;
//            let h = item.height;
//            doc.deletePage(1);
            
//            async.each(item.pages, function(page, pageCallback) {
//                console.log(`page start`);
            
//                let canvasObj = _canvasArr.filter(function (i) { return i.pageId == page.pageId })[0];
                
//                doc.addPage(w, h);
//                doc.addImage(canvasObj.toDataURL, 'JPEG', 0, 0, w, h, `page_${page.pageId}_${page.sortOrder}`, 'FAST');
            
//                pageCallback();

//            }, function (err) {
//                console.log(`page done`);
//                itemCallback();
//            });

//        }, function (err) {
//            console.log(`item done`);
//            doc.save(`${order.name}_${order.orderId}_${moment().unix()}.pdf`);
//        });
        
//    }
    
//    //Public -------------------------------------------------
//    let isPDF = true;
//    let modifier = 1;
//    let is = {
//        orderId: ``,
//        name: `Jacob Berding`,
//        callback: function (order) { 
//            //_downloadZip(order); 
//        },
//        company: {
//            companyId: ``,
//            fontHeader: `Great Vibes`,
//            fontSubHeader: `Lora`,
//            fontBody: `Didact Gothic`,
//            voidShape: 1
//        },
//        files: [{
//            orderFileId: ``,
//            orderId: ``,
//            path: `https://files.themolo.com/_orders/thumbnails/fde474a5-2f51-484c-98de-d8cc5658a6ec.jpg`,
//            originalFileName: ``,
//            width: 0,
//            height: 0,
//            resolutionHorizontal: 0,
//            resolutionVertical: 0,
//            contentLength: 0,
//            type: 1, //1 user uploaded
//            isWarning: false,
//            isPrimary: true,
//            isDeleted: false
//        },{
//            orderFileId: ``,
//            orderId: ``,
//            path: `https://files.themolo.com/_companies/5c2e8f58-e56e-4a9b-81c0-c9ba729255cc.png`,
//            originalFileName: ``,
//            width: 0,
//            height: 0,
//            resolutionHorizontal: 0,
//            resolutionVertical: 0,
//            contentLength: 0,
//            type: 5, //5 company template logo
//            isWarning: false,
//            isPrimary: false,
//            isDeleted: false
//        }],
//        events: [{
//            orderEventId: ``,
//            orderId: ``,
//            type: 1, //1 Visitation 2 Funeral 3 Cemetery
//            name: `Visitation Service for Family`,
//            startDate: `02/08/2017`,
//            startTime: `11:00am`,
//            endDate: `02/08/2017`,
//            endTime: `1:00pm`,
//            location: `Our Lady of Victory`,
//            address: `5415 Dengail Dr`,
//            section: ``,
//            officiant: `Jacob Berding`,
//            details: ``
//        }],
//        items: [{ 
//            width: 783,
//            height: 1188,
//            bleed: 24,
//            trim: 24,
//            pages: [{
//                pageId: ``,
//                itemId: ``,
//                sortOrder: 1,
//                backgroundType: 2,//1 color 2 white 3 template
//                align: 1, //1 top 2 center 3 bottom
//                isAutomated: true,
//                isDeleted: false,
//                groups: [
//                {
//                    groupId: ``,
//                    pageId: ``,
//                    type: 4, //1 Event 2 Logo 3 Name DOB DOD 4 Photo
//                    eventType: 0,
//                    sortOrder: 1,
//                    isEvent: false,
//                    isSectionExcluded: false,
//                    isDeleted: false
//                },
//                {
//                    groupId: ``,
//                    pageId: ``,
//                    type: 3, //1 Event 2 Logo 3 Name DOB DOD 4 Photo
//                    eventType: 0,
//                    sortOrder: 2,
//                    isEvent: false,
//                    isSectionExcluded: false,
//                    isDeleted: false
//                },
//                {
//                    groupId: ``,
//                    pageId: ``,
//                    type: 1, //1 Event 2 Logo 3 Name DOB DOD 4 Photo
//                    eventType: 1,
//                    sortOrder: 3,
//                    isEvent: true,
//                    isSectionExcluded: false,
//                    isDeleted: false
//                },
//                {
//                    groupId: ``,
//                    pageId: ``,
//                    type: 2, //1 Event 2 Logo 3 Name DOB DOD 4 Photo
//                    eventType: 0,
//                    sortOrder: 4,
//                    isEvent: false,
//                    isSectionExcluded: false,
//                    isDeleted: false
//                }],
//                elements: []
//            }]
//        }]
//    };

//    const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
//    const start = async (order) => {
        
//        Generate.modifier = (Generate.isPDF) ? 3 : 1;

//        async.each(order.items, function(item, itemCallback) {
//            console.log(`item start`);
//            setTimeout(function() {

//                _getPages(item, itemCallback, order);

//            }, 1000);
//        }, function (err) {
//            console.log(`item done`);
            
//            order.callback(order);
            
//            Generate.isPDF = false;
//            for (let obj of order.items)
//                _canvasArr.filter(function (i) { return i.itemId != obj.itemId }); //Clear out the canvas arr

//        });
        
//    }
    
//    return {
//        isPDF: isPDF,
//        modifier: modifier,
//        is: is,
//        start: start
//    }

//})();

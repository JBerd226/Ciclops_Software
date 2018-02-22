function getFontSizes(width, height, fontFamilies, level) {
    
    level = (!level) ? 0 : level;
    let arr = [];
    const defaultLevel = level;

    for (let fontFamily of fontFamilies) {
        
        const ratio = 1.2;
        const baseWidth = 1000;
        const x = width * height;
        //let baseFontSize = eval("24.01533+0.000001572279*x+2.399994e-13*x^2");//16;
        let baseFontSize = 24.01533 + (0.000001572279 * x) + ((2.4 * Math.pow(10, -13)) * Math.pow(x, 2));
        //y = 24.01534 + 0.000001572263*x + 2.400011e-13*x^2
        //console.log(`baseFontSize`);
        //console.log(baseFontSize);
        //console.log(x);
        const textMeasurer = new TextMeasurer();
        const baseFontSizeHeight = textMeasurer.measureText('Lora');
        const newFontSizeHeight = textMeasurer.measureText(fontFamily);
        
        //if different divide the two to get a ratio to times the base fontSize by 
        if (baseFontSizeHeight.height != newFontSizeHeight.height) {
            const m = newFontSizeHeight.height / baseFontSizeHeight.height;
            baseFontSize = baseFontSize * m;
        }
    
        //level = defaultLevel + ((width - baseWidth) / 238); //238 equals one level
        //y = 7.273521 + 0.001140215 * x + 8.622356e - 7 * x^2
        //y = 7.689511 + 0.000001892 * x + 6.469928e - 13 * x^2 scale 1
        //y = 23.06853 + 0.000005675999*x + 1.940979e-12*x^2 scaled correctly with 3 times area and 3 times font size
        //y = 24.01533 + 0.000001572279*x + 2.399994e-13*x^2  with new areas 
        arr.push({
            fontFamily: fontFamily,
            fontSize:   Math.round(Math.pow(ratio, level) * baseFontSize),
            height:     newFontSizeHeight.height,
            width:      newFontSizeHeight.width
        });

    }
    
    return arr;

}
function TextMeasurer() {    
    
    this.measureText = function(fontFamily) {

        var fontSize = `50px`;
        var fontWeight = `normal`;
        var fontFamily = fontFamily || `Open Sans`;
        var font = fontWeight + ' ' + fontSize + ' ' + fontFamily;
        var boundingRect = this.measureBoundingRect(`1234567890abcdefghihklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`, font);
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        canvas.width = boundingRect.width;
        canvas.height = boundingRect.height * 1.2; // Bounding rect height may not be enough as fillText() will render from the baseline 
        context.font = font;
        context.fillText(`1234567890abcdefghihklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`, 0, fontSize.replace('px', ''));
        
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        var result = this.measure({ width: canvas.width, height: canvas.height, imageData: imageData });
        
        if (!result.foundTopText) {
            return { width: boundingRect.width, height: 0, yOffset: 0 };
        }
        
        if (!result.foundBottomText) {
            return { width: boundingRect.width, height: canvas.height - result.topTextY, yOffset: -result.topTextY };
        }
        
        return { width: boundingRect.width, height: result.bottomTextY - result.topTextY, yOffset: -result.topTextY };

    }
  
    this.measureBoundingRect = function(text, font) {
        var temporaryContainer = document.createElement('div');
        temporaryContainer.style.position = 'fixed';
        temporaryContainer.style.top = '0px';
        temporaryContainer.style.left = '0px';
        temporaryContainer.style.width = '0px';
        temporaryContainer.style.height = '0px';
        temporaryContainer.style.overflow = 'hidden';
        
        var temporaryElement = document.createElement('span');
        temporaryElement.style.font = font;
        temporaryElement.innerText = text;
        document.body.appendChild(temporaryElement);
        var bBox = temporaryElement.getBoundingClientRect();
        document.body.removeChild(temporaryElement);
        return bBox;
    }
  
    function Iterator(maxWidth, maxHeight) {

        this.x = 0;
        this.y = 0;
        this.index = 0;
        
        this.moveRight = function() {
            if (this.arePixelsToTheRight()) {
                this.x++;
                this.index += 4;
            } else {
                this.moveDown();
            }
        }
        
        this.moveDown = function() {
            this.x = 0;
            this.y++;
            this.index = this.y * maxWidth * 4;
        }
        
        this.arePixelsToTheRight = function() {
            return this.x < maxWidth - 1;
        }
        
        this.noMorePixels = function() {
            return this.index >= (maxWidth * maxHeight * 4) - 4;
        }

    }
  
    this.measure = function(parameters) {
        // Find the top and bottom of the text by finding which rows are entirely full of transparent pixels.
        // The difference between the top-most transparent row and the bottom-most transparent row is the text height.    
        var iterator = new Iterator(parameters.width, parameters.height);
        var foundTopText = false;
        var foundBottomText = false;
        var topTextY = null;
        var bottomTextY = null;
        var allPixelsInThisRowAreWhite;
        while (!iterator.noMorePixels()) {
            if (!foundTopText) {
                // We have only encounted rows that are totally white so far, as soon as we 
                // find a pixel that is not white we will count that as the top of the text
                if (isTransparent(parameters.imageData, iterator.index)) {
                    iterator.moveRight();
                } else {
                    topTextY = iterator.y;
                    foundTopText = true;
                    iterator.moveDown();
                }
            } else {
                // We are looping through the rows until we find a row which is all white, 
                // in which case we have reached the bottom of the text
                if (!iterator.arePixelsToTheRight()) {
                    if (allPixelsInThisRowAreWhite) {
                        bottomTextY = iterator.y;
                        foundBottomText = true;
                        break;
                    }  
                    allPixelsInThisRowAreWhite = true;
                    iterator.moveDown();
                }
                if (!isTransparent(parameters.imageData, iterator.index)) {
                    allPixelsInThisRowAreWhite = false;
                    iterator.moveDown();
                } else {
                    iterator.moveRight();
                }
            }
        }
        
        return { foundTopText: foundTopText, foundBottomText: foundBottomText, topTextY: topTextY, bottomTextY: bottomTextY };

    }
  
    function isTransparent(imageData, index) {
        return imageData.data[index + 3] === 0; // If there is zero alpha then it is transparent
    }
  
}
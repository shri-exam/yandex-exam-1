var Slider = function ( obj ) {

    var
        $sliderNode     = obj.sliderNode,
        imagesLinks     = obj.imagesLinks,
        selectedImage   = obj.selectedImage || 0,
        imageClassName  = obj.imageClassName,
        mayScroll       = obj.mayScroll,
        $arrowLeft      = obj.arrowLeft,
        $arrowRight     = obj.arrowRight,
        onChangeCurrentImage = obj.onChangeCurrentImage,
        onClickOnImage  = obj.onClickOnImage,
        shortDrifting   = obj.shortDrifting,
        maxImages       = obj.maxImages,
        selectedClass   = obj.selectedClass,
        idPrefix        = obj.idPrefix,
        backgroundSize  = obj.backgroundSize || 'auto auto',
        preloadMultiplier=obj.preloadMultiplier || 2;

    if ( !$sliderNode || !imagesLinks )
        throw new Error( '[Slider]: not enough params' );

    if ( $arrowLeft ) $arrowLeft.click(function(){ driftFor( -1 ) });
    if ( $arrowRight ) $arrowRight.click(function(){ driftFor( 1 ) });

    var
        imagesQuantity,
        positionDelta,
        positionPrefix,
        currentImageIndex,
        positionTop,
        nodeWidth,
        imageContSizeHeight,
        imageContSizeWidth,
        allStartedToLoad = false,
        startedLoadTotal = 0,
        quantityToPreload,
        bin = [];

    var calculateParams = function () {

        nodeWidth = $sliderNode.width();

        var $testDiv = $('<div class="testDiv" id="testDiv"></div>');
        $testDiv.appendTo( $sliderNode );
        var testDivHeight = $testDiv.height();
        positionTop = $testDiv.position().top;
        $testDiv.remove();
        imageContSizeHeight = testDivHeight;
        imageContSizeWidth  = maxImages != 1 ? testDivHeight : nodeWidth;

        imagesQuantity = maxImages || Math.floor( nodeWidth / imageContSizeWidth );
        if ( ! (imagesQuantity % 2) ) imagesQuantity--;
        positionDelta = Math.floor( nodeWidth / imagesQuantity );
        positionPrefix =Math.floor( ( nodeWidth - imagesQuantity * positionDelta + positionDelta - imageContSizeWidth ) / 2 );
        quantityToPreload = preloadMultiplier * imagesQuantity;
    }

    var createBin = function ( justObj ) {
        var bin = [];
        for ( var i in imagesLinks ) {
            bin[i] = {};
            bin[i].obj = $('<div class="'+imageClassName+'"><center>' + '...' + '</center></div>');
            bin[i].obj.attr( 'id', idPrefix + i );
            bin[i].obj[0].onclick = function(){ onClickOnImage( this.id ) };
            bin[i].img = $('<img>');
            bin[i].img[0].onload = (function(i){return function(){
                bin[i].obj.text('');
                bin[i].obj.css ({
                    'backgroundImage' : 'url(' + imagesLinks[i] + ')',
                    'backgroundRepeat' : 'no-repeat',
                    'backgroundPosition' : 'center',
                    'backgroundSize' : backgroundSize
                });
            }})(i);
        }
        return bin;
    }

    var setCalculatedSizes = function () {
        for ( var i in imagesLinks ) {
            bin[i].obj.css({
                'height' : imageContSizeHeight + 'px',
                'width' :  imageContSizeWidth + 'px',
                'top' : positionTop  + 'px'
            });
        }
    }

    var startLoading = function ( from, to ) {
        if ( allStartedToLoad ) return;
        if ( from < 0 ) from = 0;
        if ( to > ( imagesLinks.length - 1 ) ) to = imagesLinks.length - 1;
        for ( i = from; i <= to; i++ ) {
            if ( bin[i].startedLoad ) continue;
            bin[i].img[0].src = imagesLinks[i];
            bin[i].startedLoad = true;
            startedLoadTotal++;
        }
        allStartedToLoad = ( startedLoadTotal == imagesLinks.length ) ? true : false;
    }

    var Rendered = [],
        bin = [];

    var render = function ( centerTo ) {
        for ( var i in Rendered ) { $( '#' + idPrefix + Rendered[+i] ).remove(); }
        Rendered = [];
        selectedImage = ( centerTo || centerTo == 0 ) ? centerTo : selectedImage;
        currentImageIndex = selectedImage;

        var center = Math.ceil( imagesQuantity / 2 ),
            index  = selectedImage - center + 1;
        if ( index < 0 ) index = 0;
        if ( index > ( bin.length - 1 - imagesQuantity ) ) index = bin.length  - imagesQuantity;
        for ( var i = 0; i < imagesQuantity; i++ ) {
            var left = positionPrefix + positionDelta * i + 'px';
            bin[index + i].obj.css( 'left', left );
            bin[index + i].obj.appendTo( $sliderNode );
            Rendered.push( index + i );
        }
        startLoading( Rendered[0] - quantityToPreload, Rendered[imagesQuantity - 1] + quantityToPreload );
    }

    var animatedNow = [];

    var driftTo = function ( value, doNotAnimate ) {
        if ( currentImageIndex == value ) return;
        if ( shortDrifting ) {
            var delta = ( value - currentImageIndex ) > 0 ? 1 : -1,
                element = value - Math.ceil( imagesQuantity / 2 ) * delta,
                value = delta;
            drift( value, element, delta, doNotAnimate );
            return;
        }
        value -= currentImageIndex;
        var delta   = value > 0 ? 1 : -1, 
            element = value > 0 ? Rendered[Rendered.length - 1] : Rendered[0];
        drift( value, element, delta, doNotAnimate );
    }
    this.driftTo = driftTo;

    var driftFor = function ( value, doNotAnimate ) {
        var delta   = value > 0 ? 1 : -1, 
            element = value > 0 ? Rendered[Rendered.length - 1] : Rendered[0];
        drift( value, element, delta, doNotAnimate );
    }
    this.driftFor = driftFor;

    function drift( value, element, delta, doNotAnimate ) {
        if ( animatedNow.length ) return;
        var n = 0,
            i = element;
        if ( $arrowLeft || $arrowRight ) manageArrows( delta, (element + value) );
        // append new elements to $sliderNode, add its bin-indexes to Rendered,
        // and calculate its positions
        while ( i != (element + value) && bin[i + delta] ) {
            i += delta;
            if (value > 0) {
                Rendered.push(i);
                var left = positionPrefix + positionDelta * (Rendered.length - 1) + 'px';
            }
            else {
                Rendered.unshift(i);
                n--;
                var left = positionPrefix + positionDelta * n + 'px';
            }
            bin[i].obj.css( 'left', left );
            bin[i].obj.appendTo( $sliderNode );
        }
        var elemsAdded = i - element;
        // set new positions ( animated if it is needed )
        for ( var i in Rendered ) {
            var left = value < 0 ?
                positionPrefix + positionDelta * i + 'px':
                positionPrefix + positionDelta * ( i - elemsAdded ) + 'px';
                animatedNow.push( $.Deferred() );
            if ( !doNotAnimate ) bin[ Rendered[i] ].obj.animate( { 'left' : left }, 300, 'linear', (function(a){return function(){
                    animatedNow[a].resolve()
                }})(animatedNow.length -1) );
            else {
                bin[ Rendered[i] ].obj.css( 'left', left );
                animatedNow[animatedNow.length -1].resolve();
            }
        }
        $.when.apply( this, animatedNow ).done( function(){animatedNow = []; removeInvisible(elemsAdded)} );
    }

    // remove invisible elements ( old ) from $sliderNode,
    // and its indexes from Rendered
    function removeInvisible (value) {
        var i = Math.abs(value);
        while (i) {
            if ( value > 0 ) var index = Rendered.shift();
            else var index = Rendered.pop();
            bin[index].obj.remove();
            i--
        }
        var centerIndex = Math.ceil( Rendered.length / 2 ) - 1;
        currentImageIndex = Rendered[centerIndex];
        startLoading( Rendered[0] - quantityToPreload, Rendered[imagesQuantity - 1] + quantityToPreload );
        if ( typeof onChangeCurrentImage == 'function' ) onChangeCurrentImage( currentImageIndex );
    };

    function manageArrows ( direction, requestedIndex ) {
        var $forwardArrow = direction > 0 ? $arrowRight : $arrowLeft;
            $backwardArrow = direction > 0 ? $arrowLeft : $arrowRight;
        if ( ! bin[requestedIndex + direction] ) $forwardArrow.hide();
        $backwardArrow.show();
    }

    var selectTheImage = function ( i ) {
        if ( selectedClass ) bin[selectedImage].obj.removeClass( selectedClass );
        selectedImage = i;
        if ( selectedClass ) bin[i].obj.addClass( selectedClass );

    }
    this.selectTheImage = selectTheImage;

    function addWheelEvent ( obj ) {
        if (obj.addEventListener) {
            if ('onwheel' in document) {
                obj.addEventListener ("wheel", scrolled, false);
            } else if ('onmousewheel' in document) {
                obj.addEventListener ("mousewheel", scrolled, false);
            } else {
                obj.addEventListener ("MozMousePixelScroll", scrolled, false);
            }
        } else {
            obj.attachEvent ("onmousewheel", scrolled);
        }
    }

    var scrolled = function ( e, doStopCount ) {
        if ( doStopCount ) {
            var W = wheel.snaps,
                direction = W > 0 ? 1 : -1;
            if ( Math.abs( W ) > 2 || Math.abs( W ) > imagesQuantity )
                W = imagesQuantity * direction;
            driftFor ( W );
            wheel = { snaps : 0, waiting : false };
            return;
        }
        e = e || window.event;
        var delta = e.deltaY || e.detail || e.wheelDelta;
        wheel.snaps += delta > 0 ? -1 : 1;
        if ( ! wheel.waiting ) {
            wheel.waiting = true;
            setTimeout( function(){scrolled( '', true )}, 50 )
        }
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    }

    if ( mayScroll ) {
        var wheel = { snaps : 0, waiting : false };
        addWheelEvent( $sliderNode[0] );
    }

    this.init = function () {
        calculateParams();
        bin = createBin();
        setCalculatedSizes();
        render();
        selectTheImage( selectedImage );
    }


    this.onResize = function () {
        calculateParams();
        setCalculatedSizes();
        render();
    }
}

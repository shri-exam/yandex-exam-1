
var movingInOriginList = false,
    doNotHideArrows = false;

$('.arrow').mouseover(function(){ doNotHideArrows = true });
$('.arrow').mouseout(function(){ doNotHideArrows = false });

$('#origin').mousemove(function(){
    if ( movingInOriginList ) return;
    $('.arrowContainer').show();
    movingInOriginList = true;
    setTimeout( function(){
        movingInOriginList = false;
        if ( ! doNotHideArrows ) $('.arrowContainer').hide();
    } ,2000 );
});

$('#thumbs').mouseenter(function(){
    $('#thumbs').animate( { 'bottom' : 0 }, 200, 'linear' );
});
$('#thumbs').mouseleave(function(){
    $('#thumbs').animate( { 'bottom' : -170 }, 200, 'linear' );
});

/* just temporary stub for Yandex.fotki.API */
var YfApi = (function(){
    var Y = {};
    Y.thumbLinks = function () {
        var links = [];
        for ( i = 1; i <= 300; i++ ) {
            links.push( 'thumbs/' + i + '.png' );
        }
        return links
    }
    Y.originLinks = function () {
        var links = [];
        for ( i = 1; i <= 300; i++ ) {
            links.push( 'origin/' + i + '.png' );
        }
        return links
    }
    return Y
})();

var selectedImage = getCookie( 'lastPic' );

var thumbs = new Slider({
        'sliderNode'    : $('#thumbs'),
        'imagesLinks'   : YfApi.thumbLinks(),
        'selectedImage' : selectedImage,
        'imageClassName': 'thumb',
        'mayScroll'     : true,
        'idPrefix'      : 't',
        'selectedClass' : 'selected',
        'onClickOnImage' : function( id ){
            var i = id.replace( /[a-z]+/i, '' );
            origin.driftTo( i );
            thumbs.driftTo( i );
            origin.selectTheImage( i );
        }
    });
thumbs.init();

var origin = new Slider({
        'sliderNode'    : $('#origin'),
        'imagesLinks'   : YfApi.originLinks(),
        'selectedImage' : selectedImage,
        'imageClassName': 'origin',
        'mayScroll'     : true,
        'arrowLeft'    : $('#arrowLeft'),
        'arrowRight'   : $('#arrowRight'),
        'onChangeCurrentImage' : function( i ){
            thumbs.driftTo( i, true );
            thumbs.selectTheImage( i );
            setCookie( 'lastPic', i, { 'expires' : 2592000 } );
        },
        'shortDrifting' : true,
        'maxImages'     : 1,
        'idPrefix'      : 'o',
        'backgroundSize': 'contain'
    });
centerOriginsList();
origin.init();

var onWindowResize = function(){
    origin.onResize();
    thumbs.onResize();
    centerOriginsList();
}

function centerOriginsList () {
    var O = $('#origin');
    O.css({
        'position':'absolute',
        'left': ($(window).width() - O.outerWidth())/2,
        'top': ($(window).height() - O.outerHeight())/2
    });
}



function setCookie(name, value, options) {
    options = options || {};
  
    var expires = options.expires;
  
    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires*1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) { 
    	options.expires = expires.toUTCString();
    }
  
    value = encodeURIComponent(value);
  
    var updatedCookie = name + "=" + value;
  
    for(var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];    
        if (propValue !== true) { 
            updatedCookie += "=" + propValue;
         }
    }
  
    document.cookie = updatedCookie;
}

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}


$(window).resize( onWindowResize );

/**
 * jPageFlip
 *
 * @url		    : http://jpageflip.just-page.de
 * @author    : Erik Stelzer
 * @version	  : 0.9.1
 *
 * Copyright 2010, Erik Stelzer
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php 
 * 
 * --------------------------------------------------------
 * Versión mejorada
 * @date        : 2019 
 * @author      : Adolfo Gómez - (agomcan@gmail.com)
 * @version     : 0.9.9
**/



(function ($) {
    

    $.jPageFlip = function (el, options) {

        // ********************
        // Valores por defecto
        // ********************
        
        console.log("Tomamos valores por defecto...");
        $.jPageFlip.defaultOptions = {
            pageAnimation: true,
            animationSpeed: 30,
            animationDynamic: 30,
            cornerSize: 150,
            showCorner: true,
            cornerColor: '#ffffff',
            cornerAlpha: 0.8,
            left: 0,
            top: 0,
            startPage: 1,
            shadowWidth: 15,
            shadowOpacity: 0.8,
            flipOnClick: true,
            width: 0,
            height: 0,
            url: '' // Es el archivo que deseamos leer.
        };

        var sino = 0;
        var base = this;
        base.$el = $(el);
        base.el = el;
        

        // ****************************************************************************** 
        // Declarar e inicializar variables.
        // ******************************************************************************

        base.$el.data("jPageFlip", base);
        var ctx = new Object();              // Contexto para canvas canvasPageFlip
        var ctx2 = new Object();             // Contexto para canvas canvasPageFlip2
        var contentX;                        // Left definido en la configuracion (desplazamiento respecto a la izquierda).
        var contentY;                        // Top definido en la configuracion (desplazamiento respecto del margen de arriba).
        var iWidth;                          // Ancho de la Imagen definido en la configuracion.
        var iHeight;                         // Alto de la Imagen definido en la configuracion.
        var innerMx;                         // iWidth + contentX;    Coordenada X del centro del circulo interior 
        var innerMy;                         // Coordenada Y del centro del circulo interior.
        var outerMx;                         // Coordenada X del centro del circulo exterior.
        var outerMy;                         // Coordenada Y del centro del circulo exterior.
        var outerRadius;                     // Radio del círculo exterior 
        var mouseAbsX;                       // Coordenada X absoluta del raton.
        var mouseAbsY;                       // Coordenada Y absoluta del raton. 
        var mouseRelCenterX = 0;             // Coordenada X relativa al centro X del circulo (interior / exterior ???)
        var mouseRelCenterY = 0;             // Coordenada Y relativa al centro X del circulo (interior / exterior ???)
        var newPosX = innerMx + mouseRelCenterX;
        var newPosY = mouseRelCenterY;
        var is_mouseDown = false;
        var degHelp = Math.PI / 180;         // Formula para convertir de Grados a Racianes. (degHelp multiplicado por los grados nos devuelve radianes).
        var CX;
        var CY;
        var MCX = 0;
        var MCY = 0;
        var r1x = 0;
        var r1y = 0;
        var r2x = 0;
        var r2y = 0;
        var T1C = 0;
        var T1X = 0;
        var T1Y = 0;
        var T2X = 0;
        var T2Y = 0;
        var T1YRel = 0;
        var CLeftCX = 0;
        var T2CX = 0;
        var T2CY = 0;
        var angleClip = 0;
        var angleImage = 0;
        var isFlipped = false;               // ...no se está utilizando...
        var actPage;                         // página actual
        var flipDirection = 0;               // ...no se esta utilizando...
        var takePage;                        // Indica la accion de Tomar pagina
        var dropPage;                        // Indica la accion de Soltar pagina.
        var z = 0;
        var dynamicHelp = 0;
        var tabCorner = false;               // ...no se esta utilizando...
        var angleCXMCY = 0;
        var angleT1XT1Y = 0;
        var isMouseInCornerDOWN = false;     // Indica si se hizo click seleccionado alguno de los corners inferiores.
        var isMouseInCornerUP = false;       // Indica si se hizo click seleccionado alguno de los corners superiores.
        var gradient = new Object();         // Definición de las sombras del libro.
        var flipImage = new Array();         // Colección de las Imagenes a mostrar. (es un vector de src donde se localizan...)
        var ImageBook = new Image();         // Es la imagen de fondo para decorar el libro.
        var video = new Object();            // Objeto Video que se inserta en el libro.
        var audio = new Object();            // Objeto Audio que se inserta en el libro.   
        var imgFlipFrontRight = new Image(); // Imagen Frontal Derecha
        var imgFlipBackRight = new Image();  // Imagen Trasera Derecha
        var imgFlipFrontLeft = new Image();  // Imagen Frontal Izquierda
        var imgFlipBackLeft = new Image();   // Imagen Trasera Izquierda
        var interval;                        // Es el retardo definido para variar la velocidad de paso de paginas..
        var _timer;
        var url = '';                        // Path completo del archivo que queremos leer.
        
        //#region Leer Imagenes incluso en precarga.

        // ****************************************************************************** 
        // Cargar imagenes
        // ******************************************************************************
        base.getImages = function () {
            var i = 0;
            var h;
            
            

            // Recorre los elementos html buscando los marcados con la clase .jPageFlip
            // Crea un vector flipImage[i] con los scr de cada uno.
            i= $.each(base.$el.find('.jPageFlip'), function (i) {
                                
                $(this).css('display', 'none'); // Ocultar todas las imágenes en la mesa de trabajo
                i++;
                if (this.nodeName == 'IMG')
                    flipImage[i] = new Image();
                else if (this.nodeName == 'VIDEO' || this.nodeName == 'AUDIO' )
                    flipImage[i] = new Object();

                
                flipImage[i]["src"] = this.src;
                flipImage[i] = this;
            });

            // Portada del Libro aparece siempre.
            flipImage[0] = new Image();
            flipImage[0]['src'] = 'js/jPageFlip-0.9.7/image/clearpixel_446x631.gif';

            i = parseInt(flipImage.length - 1);

            // Necesitamos saber si el numero de paginas leidas es par o impar.
            if (i % 2 != 0) {
                // Si es impar necesitamos añadir una hoja en blanco antes de la contraportada...
                flipImage[i + 1] = new Image();
                flipImage[i + 1]['src'] = 'js/jPageFlip-0.9.7/image/paginaBlanca_446x631.gif';

                // Y la  Contraportada
                flipImage[i + 2] = new Image();
                flipImage[i + 2]['src'] = 'js/jPageFlip-0.9.7/image/clearpixel_446x631.gif';

            } else {
                // Si es par, entonces solo la Contraportada.
                flipImage[flipImage.length] = new Image();
                flipImage[flipImage.length - 1]['src'] = 'js/jPageFlip-0.9.7/image/clearpixel_446x631.gif';
            }

            // Oculta el Loader al termianr de leer las imagenes de las paginas.
            //var element = document.getElementById("loader");
            //element.classList.add("ocultar");


            var help1 = 0;
            var help2 = 0;

            imgFlipBackLeft = flipImage[actPage - 1];
            imgFlipFrontLeft = flipImage[actPage - 1];
            imgFlipFrontRight = flipImage[actPage];     // actPage      representa la pagina frontal de la derecha
            imgFlipBackRight = flipImage[actPage + 1];  // actPage + 1  representa la parte trasera de la derecha
            iHeight = base.options.height;
            iWidth = base.options.width;
            //base.preloadImage();
            base.initializeContent();

            // Asignación auxiliar para la precarga (de lo contrario, no se mostrará ninguna imagen en la primera llamada)
            flipImage[actPage - 1].src = imgFlipFrontLeft.src;
            flipImage[actPage].src = imgFlipFrontRight.src;
            console.log('Imagenes Introducidas en el Libro...');

           

        }

        // ****************************************************************************** 
        // Image-Preload
        // ******************************************************************************
        var help1 = 0;
        var help2 = 0;
        var t1;
        base.preloadImage = function () {
            window.clearTimeout(t1);
            flipImage[actPage - 1].onload = function () {
                // Leer ancho y alto
                help2 = 1;
            }

            flipImage[actPage].onload = function () {
                // Leer ancho y alto
                help1 = 1;
            }

            iHeight = flipImage[actPage - 1].height;
            iWidth = flipImage[actPage - 1].width;
            if ((iHeight == 0) || (iWidth == 0) || (help1 == 0) || (help2 == 0)) {
                t1 = window.setTimeout(function () { base.preloadImage() }, 10);
            }
            //else
            base.initializeContent();
        }

        //#endregion



        // ****************************************************************************** 
        // Inicializar página 
        // ****************************************************************************** 
        base.init = function () {
           
           
            // Esto aun no se si será necesario....
            // Asi creamos un enlace <link> a un CSS
            importarCSS("js/jPageFlip-0.9.7/css/style.css");

            // Inicializar parámetros de opción
            base.options = $.extend({}, $.jPageFlip.defaultOptions, options);

            // Establecer la posición del lienzo
            contentX = base.options.left; // posicion respecto a la izquierda de la pantalla.
            contentY = base.options.top;  // posicion respecto a la parte superior de la pantalla.

            // Establecer página de inicio
            actPage = base.options.startPage;

            // Cargar imagenes que estan en el html con <img>
            base.getImages();

            // Paginación suave (actualmente) siempre
            pageAnimation = base.options.pageAnimation;
            showCorner = base.options.showCorner;
            shadowOpacity = base.options.shadowOpacity;
            cornerSize = base.options.cornerSize;
            cornerColor = base.options.cornerColor;
            cornerAlpha = base.options.cornerAlpha;
            flipOnClick = base.options.flipOnClick;
        }

        // *****************************************************************
        // Definimos los contenedores Canvas (lienzos) que vamos a utilizar.
        // *****************************************************************
        base.initializeContent = function () {

            innerMx = iWidth + contentX;
            innerMy = iHeight;
            outerMx = innerMx;
            outerMy = innerMy - iHeight;
            outerRadius = Math.sqrt(iWidth * iWidth + iHeight * iHeight); // Circulo exterior


            $(base.el).children().remove(); // Limpie el escritorio (solucione el problema de Firefox con la recarga (F5))
            $(base.el).css({ 'position': 'relative', 'width': 2 * iWidth, 'height': iHeight  });

            // CONTENEDOR PARA EL FONDO DEL LIBRO
            var s = document.createElement("div");
            s.id = "libro";
            s.className = "milibro";
            $(base.el).prepend(s);

            // LO QUE HABIA
            //$(base.el).prepend('<div id="canvascontainer" style="position:absolute;z-index: 10;">');
            //$(base.el).prepend('<div id="canvascontainer2" style="position:absolute;z-index: 8;">');

            // NUEVA VERSION
            // le he añadido el margen...
            // Creo que el primer canvascontainer es donde hace el efecto de flip y
            // en canvascontainer2 es donde estan los corners definidos.
            $("#libro").prepend('<div id="canvascontainer" style="position:absolute;z-index: 10;left:6%; top:2.7%;">');
            $("#libro").prepend('<div id="canvascontainer2" style="position:absolute;z-index: 8;left:6%; top:2.7%;">');

            // lO QUE HABIA
            $('#canvascontainer').append('<canvas id="canvasPageFlip" width="' + 1.75 * iWidth + '" height="' + 0.95 * iHeight + '" style="background-color: none;">');
            $('#canvascontainer2').append('<canvas id="canvasPageFlip2" width="' +  1.75 * iWidth + '" height="' + 0.95 * iHeight + '" style="background-color: none;">');

            // fotos estáticas
            $(base.el).append('<div id="pageBackgroundLeft">');
            $(base.el).append('<div id="pageBackgroundRight">');
            $(base.el).append('<div id="pageBackgroundLeft2">');
            $(base.el).append('<div id="pageBackgroundRight2">');
            
            
            $('#pageBackgroundLeft').css({ 'left': (innerMx - iWidth + 60 ) + 'px', 'top': contentY + 20 + 'px', 'position': 'absolute', 'z-index': '5', 'width':  0.905 * iWidth, 'height': 0.96 * iHeight, 'background': 'none' });
            $('#pageBackgroundLeft2').css({ 'left': (innerMx - iWidth + 60) + 'px', 'top': contentY + 20 + 'px', 'position': 'absolute', 'z-index': '4', 'width':  0.905 * iWidth, 'height': 0.96 * iHeight, 'background': 'none' });
            $('#pageBackgroundRight').css({ 'left': innerMx - 1 + 'px', 'top': contentY + 20 + 'px', 'position': 'absolute', 'z-index': '5', 'width': 0.865 * iWidth, 'height': 0.96 * iHeight, 'background': 'none'});
            $('#pageBackgroundRight2').css({ 'left': innerMx - 1 + 'px', 'top': contentY + 20 + 'px', 'position': 'absolute', 'z-index': '4', 'width': 0.865 * iWidth, 'height': 0.96 * iHeight, 'background': 'none'});
            

            // Establecer imágenes de inicio
            if (flipImage[actPage - 1])
                $('#pageBackgroundLeft').html('<img style="width: 95%; height:98%;" src="' + flipImage[actPage - 1].src + '">');
            if (flipImage[actPage])
                $('#pageBackgroundRight').html('<img style="width: 100%; height:98%;" src="' + flipImage[actPage].src + '">');
            if (flipImage[actPage - 2])
                $('#pageBackgroundLeft2').html('<img style="width: 95%; height:98%;" src="' + flipImage[actPage - 2].src + '">');
            if (flipImage[actPage + 1])
                $('#pageBackgroundRight2').html('<img style="width: 100%; height:98%;" src="' + flipImage[actPage + 1].src + '">');

            // Inicializar Canvas
            ctx = document.getElementById('canvasPageFlip').getContext('2d');
            ctx2 = document.getElementById('canvasPageFlip2').getContext('2d');
            
            // esquinas
            if (base.options.showCorner)
                base.drawCorners();

            // sombra
            base.drawShadowsBack();

            // Eventos de Teclado
            $(document).bind({ keyup: function (event) { base.keyup(event) } });

            // Eventos
            //$(document).bind({ mousewheel: function (event) { base.mousewheel(event) } });     // Rueda del Raton para Crome e Ineternet Explorer
            //$(document).bind({ DOMMouseScroll: function (event) { base.mousewheel(event) } }); // Rueda del Raton para FireFox
            $(base.el).bind({ mousemove: function (event) { base.mouseMove(event) } });
            $(base.el).bind({ mousedown: function (event) { base._mouseDown(event) } });
            $(base.el).bind({ mouseup: function (event) { base._mouseUpInCornerDown(event) } }); //Soltar raton que seleccionó en corner inferior
            $(base.el).bind({ mouseup: function (event) { base._mouseUpInCornerUp(event) } });   //Soltar raton que seleccionó en corner superior
            $(base.el).bind({ mouseleave: function (event) { $(base.el).css('cursor', 'auto'); } });
            
        }


        //#region Acciones de Teclado 

        // ****************************************************************************** 
        // Pasar paginas con las flechas del teclado
        // ****************************************************************************** 
        base.keyup = function (e) {
            var x = e.keyCode;
            if (x == 37) {
                //alert("anterior");
                dropPage = 1;
                base.pageFlipKey();
            }
            if (x == 39) {
                //alert("Siguiente");
                dropPage = -1;
                base.pageFlipKey();
            }
            if (x == 38) {
                base.Zoom_Acercar();
            }
            if (x == 40) {
                base.Zoom_Alejar();
            }
        }
        
        //#endregion


        //#region Acciones del Raton

        // *********************************************************************************
        // Zoom Acercar que es comun a la tecla "Flecha Arriba" y Ruleta raton hacia abajo.
        // *********************************************************************************
        base.Zoom_Acercar = function () {
            alert("Scroll arriba, (ZOOM + )");
        }

        // *********************************************************************************
        // Zoom Alejar que es comun a la tecla "Flecha Abajo" y Ruleta raton hacia arriba.
        // *********************************************************************************
        base.Zoom_Alejar = function () {
            alert("Scroll abajo, (ZOOM -)");
        }
     
        // ******************************************************************************
        // Ruleta del Raton para hacer Zoom
        // ******************************************************************************
        base.mousewheel = function (e) {
            if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
                base.Zoom_Acercar();
            } else {
                base.Zoom_Alejar();
            }
        }

        // ****************************************************************************** 
        // Posicion Absoluta del Raton
        // ******************************************************************************
        base.mouseMove = function (e) {
            // posición absoluta del ratón
            mouseAbsX = e.pageX - $(base.el).offset().left;
            mouseAbsY = e.pageY - $(base.el).offset().top;
            // Compruebe si el mouse está en una esquina (abajo)
            base.isMouseInCornerDOWN();

            // Comprueba si el mouse está en una esquina (arriba)
            base.isMouseInCornerUP();

            // Calcular la posición del ratón
            base.calcRelMousePos();
            if (is_mouseDown)
                base.pageFlip();
        }

        // ****************************************************************************** 
        // Posicion Relativa del Raton
        // ******************************************************************************     
        base.calcRelMousePos = function () {
            mouseRelCenterX = mouseAbsX - innerMx;
            mouseRelCenterY = mouseAbsY - innerMy - contentY;
        }

        // ******************************************************************************
        // Botón del ratón presionado y estado "presionado".
        // ******************************************************************************
        base._mouseDown = function (e) {

            // Cuando selecciona un corner de abajo
            base.isMouseInCornerDOWN();
            if (isMouseInCornerDOWN) {
                if (mouseRelCenterX > 0)
                    takePage = 1;
                if (mouseRelCenterX < 0)
                    takePage = -1;
                if (base.checkFirstAndLastPage()) {
                    if (base.calculateActImages()) {
                        is_mouseDown = true;
                    }
                }
            }    

                    
            // Cuando selecciona un corner de arriba
            base.isMouseInCornerUP();
            if (isMouseInCornerUP) {
                if (mouseRelCenterX > 0)
                    takePage = 1;
                if (mouseRelCenterX < 0)
                    takePage = -1;
                if (base.checkFirstAndLastPage()) {
                    if (base.calculateActImages()) {
                        is_mouseDown = true;
                    }
                }
            }
        }


        // **********************************************************************************
        // Sucede al liberar el boton del raton cuando tenia seleccionado un corner Inferior
        // **********************************************************************************
        base._mouseUpInCornerDown = function (e) {

            $(base.el).css('cursor', 'auto');

            if (is_mouseDown) {
                is_mouseDown = false;

                if (mouseRelCenterX >= 0) {
                    var angle_clx = Math.atan((mouseRelCenterY) / Math.abs(CX - contentX - 2 * iWidth));

                    if (base.options.pageAnimation) {
                        if (base.options.flipOnClick) {
                            base.isMouseInCornerDOWN();
                            if (isMouseInCornerDOWN) {
                                if (takePage == 1)
                                    dropPage = -1;
                                if (takePage == -1)
                                    dropPage = 1;
                                angle_clx = -0.04; // Ajuste el ángulo (plano), ya que el ángulo de la imagen en la esquina es "impredecible"
                            }
                            else
                                dropPage = 1;
                        }
                        else {
                            dropPage = 1;
                        }
                        base.animateFlipping(angle_clx);
                    }
                    else {
                        if (base.options.flipOnClick) {
                            base.isMouseInCornerDOWN();
                            if (isMouseInCornerDOWN) {
                                mouseRelCenterX = -iWidth;
                                dropPage = -1;
                            }
                            else {
                                mouseRelCenterX = iWidth;
                                dropPage = 1;
                            }
                        }
                        else {
                            mouseRelCenterX = iWidth;
                            dropPage = 1;
                        }
                        mouseRelCenterY = 0;
                    }
                }
                else { // mouseRelCenterX < 0
                    var angle_clx = Math.atan((mouseRelCenterY) / (CX - contentX));
                    if (base.options.pageAnimation) {
                        if (base.options.flipOnClick) {
                            base.isMouseInCornerDOWN();
                            if (isMouseInCornerDOWN) {
                                if (takePage == -1)
                                    dropPage = 1;
                                if (takePage == 1)
                                    dropPage = -1;
                                angle_clx = -0.04;  // Ajuste el ángulo (plano), ya que el ángulo de la imagen en la esquina es "impredecible"
                            }
                            else
                                dropPage = -1;
                        }
                        else {
                            dropPage = -1;
                        }
                        base.animateFlipping(angle_clx);
                    }
                    else {
                        if (base.options.flipOnClick) {
                            base.isMouseInCornerDOWN();
                            if (isMouseInCornerDOWN) {
                                mouseRelCenterX = iWidth;
                                dropPage = 1;
                            }
                            else {
                                mouseRelCenterX = -iWidth;
                                dropPage = -1;
                            }
                        }
                        else {
                            mouseRelCenterX = -iWidth;
                            dropPage = -1;
                        }
                        mouseRelCenterY = 0;
                    }
                }
                //isMouseInCornerDOWN = false;
                base.pageFlip();
                // Recalcular la posición relativa del mouse
                mouseRelCenterX = mouseAbsX - innerMx;
                mouseRelCenterY = mouseAbsY - innerMy - contentY;
                // Compruebe si la página ha sido entregada y calcule la página actual.
                if (!base.options.pageAnimation)
                    base.calculatePage();
                // Dibujar esquinas
                if (base.options.showCorner)
                    base.drawCorners();
            }
        }

        // **********************************************************************************
        // Sucede al liberar el boton del raton cuando tenia seleccionado un corner Superior
        // **********************************************************************************
        base._mouseUpInCornerUp = function (e) {

            $(base.el).css('cursor', 'auto');

            if (is_mouseDown) {
                is_mouseDown = false;

                if (mouseRelCenterX >= 0) {

                    var angle_clx = Math.atan((mouseRelCenterY) / Math.abs(CX - contentX - 2 * iWidth)); // El original...

                    if (base.options.pageAnimation) {
                        if (base.options.flipOnClick) {
                            base.isMouseInCornerUP();
                            if (isMouseInCornerUP) {
                                if (takePage == 1)
                                    dropPage = -1;
                                if (takePage == -1)
                                    dropPage = 1;
                                angle_clx = -0.04; // Ajuste el ángulo (plano), ya que el ángulo de la imagen en la esquina es "impredecible"
                            }
                            else
                                dropPage = 1;
                        }
                        else {
                            dropPage = 1;
                        }
                        base.animateFlipping(angle_clx);
                    }
                    else {
                        // Si NO tenemos activa la paginacion...entonces se pagina por la accion del CLick simple y sin arrastrar la pagina.
                        if (base.options.flipOnClick) {
                            base.isMouseInCornerUP();
                            if (isMouseInCornerUP) {
                                mouseRelCenterX = -iWidth;
                                dropPage = -1;
                            }
                            else {
                                mouseRelCenterX = iWidth;
                                dropPage = 1;
                            }
                        }
                        else {
                            mouseRelCenterX = iWidth;
                            dropPage = 1;
                        }
                        mouseRelCenterY = 0;
                    }
                }
                else { // mouseRelCenterX < 0
                    var angle_clx = Math.atan((mouseRelCenterY) / (CX - contentX));
                    if (base.options.pageAnimation) {
                        if (base.options.flipOnClick) {
                            base.isMouseInCornerUP();
                            if (isMouseInCornerUP) {
                                if (takePage == -1)
                                    dropPage = 1;
                                if (takePage == 1)
                                    dropPage = -1;
                                angle_clx = -0.04;  // Ajuste el ángulo (plano), ya que el ángulo de la imagen en la esquina es "impredecible"
                            }
                            else
                                dropPage = -1;
                        }
                        else {
                            dropPage = -1;
                        }
                        base.animateFlipping(angle_clx);
                    }
                    else {
                        if (base.options.flipOnClick) {
                            base.isMouseInCornerUP();
                            if (isMouseInCornerUP) {
                                mouseRelCenterX = iWidth;
                                dropPage = 1;
                            }
                            else {
                                mouseRelCenterX = -iWidth;
                                dropPage = -1;
                            }
                        }
                        else {
                            mouseRelCenterX = -iWidth;
                            dropPage = -1;
                        }
                        mouseRelCenterY = 0;
                    }
                }
                //isMouseInCornerDOWN = false;
                base.pageFlip();
                // Recalcular la posición relativa del mouse
                mouseRelCenterX = mouseAbsX + innerMx;
                mouseRelCenterY = mouseAbsY + innerMy + contentY;
                // Compruebe si la página ha sido entregada y calcule la página actual.
                if (!base.options.pageAnimation)
                    base.calculatePage();
                // Dibujar esquinas
                if (base.options.showCorner)
                    base.drawCorners();
            }
        }

        //#endregion



        // ******************************************************************************
        // ¿ Saber si la pagina Flip esta activa ? --- se refiere a si se ha colocado bien ????
        // ******************************************************************************
        base.pageFlipIsActive = function (status) {
            window.clearTimeout(_timer);
            if (status) {
                //base.pageFlip();
                _timer = window.setTimeout(function () { base.pageFlipIsActive(true) }, 10);
            }
            else
                window.clearTimeout(_timer);
        }


        // ******************************************************************************
        // Calcular imágenes actuales
        // ******************************************************************************
        base.calculateActImages = function () {
            var htmlText = '';
            if (isMouseInCornerDOWN) {
                if (takePage == 1) {
                    if (flipImage[actPage - 1]) {
                        if (flipImage[actPage - 1].nodeName == 'IMG') {
                            $('#pageBackgroundLeft').html('<img style="width:95%;height:98%;" src="' + flipImage[actPage - 1].src + '">');
                        }
                        else if (flipImage[actPage - 1].nodeName == 'VIDEO') {
                            $('#pageBackgroundLeft').html(base.drawVideo(actPage - 1));
                        }
                        else if (flipImage[actPage - 1].nodeName == 'AUDIO') {
                            $('#pageBackgroundLeft').html(base.drawAudio(actPage - 1));
                        }
                    }
                    if (flipImage[actPage + 2]) { // libro final
                        if (flipImage[actPage + 2].nodeName == 'IMG') {
                            $('#pageBackgroundRight').html('<img style="WIDTH:100%; height:98%;" src="' + flipImage[actPage + 2].src + '">');
                        }
                        else if (flipImage[actPage + 2].nodeName == 'VIDEO') {
                            $('#pageBackgroundRight').html(base.drawVideo(actPage + 2));
                        }
                        else if (flipImage[actPage + 2].nodeName == 'AUDIO') {
                            $('#pageBackgroundRight').html(base.drawAudio(actPage + 2));
                        }
                    }
                    if (flipImage[actPage + 4]) { // libro final
                        if (flipImage[actPage + 4].nodeName == 'IMG') {
                            $('#pageBackgroundRight2').html('<img style="WIDTH:100%; height:98%;" src="' + flipImage[actPage + 4].src + '">');
                        }
                        else if (flipImage[actPage + 4].nodeName == 'VIDEO') {
                            $('#pageBackgroundRight2').html(base.drawVideo(actPage + 4));
                        }
                        else if (flipImage[actPage + 4].nodeName == 'AUDIO') {
                            $('#pageBackgroundRight2').html(base.drawAudio(actPage + 4));
                        }
                    }
                    if (flipImage[actPage - 3]) {
                        if (flipImage[actPage - 3].nodeName == 'IMG') {
                            $('#pageBackgroundLeft2').html('<img style="width:95%;height:98%;" src="' + flipImage[actPage - 3].src + '">');
                        }
                        else if (flipImage[actPage - 3].nodeName == 'VIDEO') {
                            $('#pageBackgroundLeft2').html(base.drawVideo(actPage - 3));
                        }
                        else if (flipImage[actPage - 3].nodeName == 'AUDIO') {
                            $('#pageBackgroundLeft2').html(base.drawAudio(actPage - 3));
                        }
                    }
                    imgFlipFrontRight = flipImage[actPage];
                    imgFlipBackRight = flipImage[actPage + 1];

                }
                if (takePage == -1) {
                    if (flipImage[actPage]) {
                        if (flipImage[actPage].nodeName == 'IMG') 
                            $('#pageBackgroundRight').html('<img style="WIDTH:100%; height:98%;" src="' + flipImage[actPage].src + '">');
                        
                        else if (flipImage[actPage].nodeName == 'VIDEO') {
                            $('#pageBackgroundRight').html(base.drawVideo(actPage));
                        }
                        else if (flipImage[actPage].nodeName == 'AUDIO') {
                            $('#pageBackgroundRight').html(base.drawAudio(actPage));
                        }
                    }
                    if (flipImage[actPage - 3]) { // libro de inicio
                        if (flipImage[actPage - 3].nodeName == 'IMG') {
                            $('#pageBackgroundLeft').html('<img style="width:95%;height:98%;" src="' + flipImage[actPage - 3].src + '">');
                        }
                        else if (flipImage[actPage - 3].nodeName == 'VIDEO') {
                            $('#pageBackgroundLeft').html(base.drawVideo(actPage - 3));
                        }
                        else if (flipImage[actPage - 3].nodeName == 'AUDIO') {
                            $('#pageBackgroundLeft').html(base.drawAudio(actPage - 3));
                        }
                    }
                    if (flipImage[actPage + 2]) { // libro de inicio
                        if (flipImage[actPage + 2].nodeName == 'IMG') {
                            $('#pageBackgroundRight2').html('<img style="WIDTH:100%; height:98%;" src="' + flipImage[actPage + 2].src + '">');
                        }
                        else if (flipImage[actPage + 2].nodeName == 'VIDEO') {
                            $('#pageBackgroundRight2').html(base.drawVideo(actPage + 2));
                        }
                        else if (flipImage[actPage + 2].nodeName == 'AUDIO') {
                            $('#pageBackgroundRight2').html(base.drawAudio(actPage + 2));
                        }
                    }
                    if (flipImage[actPage - 5]) { // libro de inicio
                        if (flipImage[actPage - 5].nodeName == 'IMG') {
                            $('#pageBackgroundLeft2').html('<img style="width:95%;height:98%;" src="' + flipImage[actPage - 5].src + '">');
                        }
                        else if (flipImage[actPage - 5].nodeName == 'VIDEO') {
                            $('#pageBackgroundLeft2').html(base.drawVideo(actPage - 5));
                        }
                        else if (flipImage[actPage - 5].nodeName == 'AUDIO') {
                            $('#pageBackgroundLeft2').html(base.drawAudio(actPage - 5));
                        }
                    }
                    imgFlipBackLeft = flipImage[actPage - 2];
                    imgFlipFrontLeft = flipImage[actPage - 1];
                }
                base.pageFlip();
                return true;
            }
        }


        //#region Textos Enriquecidos

        // ******************************************************************************
        // Video dibujar
        // ******************************************************************************
        base.drawVideo = function (page) {
            htmlText = '<video width="' + iWidth + '" height="' + iHeight + '" controls autobuffer autoplay >'; //autoplay autobuffer loop="true"
            htmlText = htmlText + '<source src="' + flipImage[page].currentSrc + '" type="video/ogg" />';
            htmlText = htmlText + '<source src="' + flipImage[page].currentSrc + '" type="video/mp4" />';
            htmlText = htmlText + 'This browser is not compatible with HTML 5';
            htmlText = htmlText + '</video>';
            return htmlText;
        }


        // ******************************************************************************
        // Archivos de Sonido dibujar
        // ******************************************************************************
        base.drawAudio = function (page) {
            htmlText = '<audio controls autoplay>';
            htmlText = htmlText + '<source src="' + flipImage[page].currentSrc + '" type="audio/ogg" />';
            htmlText = htmlText + '<source src="' + flipImage[page].currentSrc + '" type="audio/mpeg" />';
            htmlText = htmlText + '<source src="' + flipImage[page].currentSrc + '" type="audio/wav" />';
            htmlText = htmlText + 'This browser is not compatible with HTML 5';
            htmlText = htmlText + '</audio>';
            return htmlText;
        }
        //#endregion


        // ******************************************************************************
        // ******************************************************************************
        // Calcular paginación
        // ******************************************************************************
        // ******************************************************************************
        base.pageFlip = function () {
            
            // Distancia centro punto círculo interior - punto C
            MC = Math.sqrt(Math.pow(mouseRelCenterX, 2) + Math.pow(mouseRelCenterY, 2));
            
            // Distancia centro fuera del círculo - punto C
            SC = Math.sqrt(Math.pow(mouseRelCenterX, 2) + Math.pow(iHeight + mouseRelCenterY, 2));
            

            // El ratón está dentro del círculo interno.
            if ((MC <= iWidth)) {
                CX = innerMx + mouseRelCenterX-55;                 // Absolutposition X
                CY = iHeight + contentY + mouseRelCenterY+50;      // Absolutposition Y
            }

            // El ratón se encuentra fuera del círculo interno
            if (MC > iWidth) {
                MCX = iWidth * (Math.cos(Math.atan(mouseRelCenterY / mouseRelCenterX)));
                MCY = iWidth * Math.abs((Math.sin(Math.atan(mouseRelCenterY / mouseRelCenterX))));
                if (mouseRelCenterX < 0)
                    MCX = MCX * -1;
                if (mouseRelCenterY < 0)
                    MCY = MCY * -1;
                    CX = MCX + innerMx;
                    CY = MCY + iHeight + contentY;

            }

            // El ratón está fuera del círculo exterior
            angleCXMCY = Math.atan((Math.abs(CX - innerMx)) / (CY - contentY)) / degHelp;
            r2x = Math.sin(angleCXMCY * degHelp) * outerRadius;
            if (mouseRelCenterX < 0)
                r2x = r2x * -1;
                r2y = Math.cos(angleCXMCY * degHelp) * outerRadius;

            // Cálculo para esquina
            if ((SC > outerRadius) && (mouseRelCenterY > 0)) {
                CX = innerMx + r2x;
                CY = r2y + contentY;
            }


            // ******************************************************************************
            // borde de la imagen T1-T2 (t1xt1y_t2xt2y)
            // ******************************************************************************
            T1Y = (contentY + iHeight + CY) / 2;
            if (takePage == 1) {
                T1X = (innerMx + iWidth + CX) / 2;
                T1C = Math.sqrt(Math.pow(innerMx + iWidth - T1X, 2) + Math.pow(contentY + iHeight - T1Y, 2)); // Abstand T1-C
                angleT1XT1Y = Math.atan((contentY + iHeight - CY) / (innerMx + iWidth - CX));
            }
            else if (takePage == -1) {
                T1X = (innerMx - iWidth + CX) / 2;
                T1C = Math.sqrt(Math.pow(innerMx - iWidth - T1X, 2) + Math.pow(contentY + iHeight - T1Y, 2)); // Abstand T1-C
                angleT1XT1Y = Math.atan((contentY + iHeight - CY) / (innerMx - iWidth - CX));
            }
            if (!angleT1XT1Y)
                angleT1XT1Y = 0;

            // T2 : Punto en el diámetro del círculo.
            if (takePage == 1)
                T2X = innerMx + iWidth - T1C / Math.cos(angleT1XT1Y);
            else if (takePage == -1)
                T2X = innerMx - iWidth + T1C / Math.cos(angleT1XT1Y);
                T2Y = iHeight + contentY;


            // ******************************************************************************
            // Calcular el ángulo de C-T2 -> ángulo de la imagen de volteo
            // ******************************************************************************
            T2CX = T2X - CX;
            T2CY = contentY + iHeight - CY;
            if ((contentY + iHeight - CY >= 0) && (T2CY != 0))
                angleImage = 90 - (Math.atan(T2CX / T2CY) / degHelp);
            else if (T2CY != 0)
                angleImage = -90 - (Math.atan(T2CX / T2CY) / degHelp);
            else {
                if (takePage == 1)
                    angleImage = 0;
                else
                    angleImage = 180;
            }


            // ******************************************************************************
            // Calcular cliping (área de imagen derecha)
            // ******************************************************************************
            T1YRel = iHeight + contentY - T1Y;
            if (T1YRel != 0)
                angleClip = Math.atan((T1X - T2X) / T1YRel) / degHelp;
            else
                angleClip = 0;


            // ******************************************************************************
            // Eliminar toda el área de la imagen.
            // ******************************************************************************
            ctx.clearRect(0, 0, iHeight, iHeight);


            // ******************************************************************************
            // Voltear el lado derecho
            // ******************************************************************************
            if (takePage == 1) {
               
                ctx.save();
                // dibuja la imagen de la derecha
                ctx.drawImage(imgFlipFrontRight , innerMx-55 , 0 + contentY + 3 , iWidth * 0.867, iHeight*0.94); // Frente de la página volteada
                // Sombra que divide las dos hojas del libro.
                if (base.options.shadowWidth > 0)
                    base.drawShadows('left');
                ctx.save();

                ctx.translate(CX, CY);
                ctx.rotate(angleImage * degHelp);
                ctx.translate(0, -iHeight);

                // Esto es un invento mio
                var oc = document.createElement('canvas'),
                octx = oc.getContext('2d');
                oc.width = imgFlipBackRight.width * 0.46;
                oc.height = imgFlipBackRight.height * 0.46;
                // --- hasta aqui..
                ctx.drawImage(imgFlipBackRight, 0, 0, oc.width, oc.height); // Detrás de la página volteada
                ctx.restore();
                ctx.save();

                ctx.translate(CX, CY);
                ctx.rotate(angleImage * degHelp);
                ctx.restore();
                // Clippingarea
                ctx.translate(T2X, T2Y);
                ctx.rotate(angleClip * degHelp);
                ctx.translate(0, -iHeight - iWidth);
                ctx.clearRect(0, 0, 2*iWidth, 2.5*iHeight);
                //ctx.fillRect(0, 0, 2*iWidth,2.5*iHeight);
                ctx.restore();
            }
                // ******************************************************************************
                // Voltear el lado izquierdo.
                // ******************************************************************************
            else if (takePage == -1) {
              
                ctx.save();
                // Dibujar imagen de la izquierda
                ctx.drawImage(imgFlipFrontLeft, innerMx - iWidth + 5.30, 0 + contentY + 3, iWidth * 0.867, iHeight * 0.94); // Frente de la página volteada
                // Sombra que divide las dos hojas del libro.
                if (base.options.shadowWidth > 0)
                    base.drawShadows('right');
                ctx.save();
                ctx.translate(CX, CY);
                ctx.rotate((angleImage + 180) * degHelp);
                ctx.translate(-iWidth, -iHeight);

                // Esto es un invento mio
                var oc = document.createElement('canvas'),
                octx = oc.getContext('2d');
                oc.width = imgFlipBackLeft.width * 0.46;
                oc.height = imgFlipBackLeft.height * 0.46;
                // ---- hasta aqui...
                ctx.drawImage(imgFlipBackLeft, 0, 0, oc.width, oc.height); // Detrás de la página volteada
                ctx.restore();
                // Clippingarea
                ctx.translate(T2X, T2Y);
                ctx.rotate(angleClip * degHelp);
                ctx.translate(-2 * iWidth, -iHeight - (Math.abs(iHeight - iWidth)));
                ctx.clearRect(0, 0, 2 * iWidth, 2.5 * iHeight);
                //ctx.fillRect(0, 0, 2*iWidth,3*iWidth);
                ctx.restore();
            }
            return true;
        } // pageflip()

        


        // *********************************************
        // Calcula la Paginacion con fechas del Teclado
        // *********************************************
        base.pageFlipKey = function () {
            alert("Tiene que pasar la pagina sola");
        }


        // ******************************************************************************
        // Compruebe si la página ha sido entregada y calcule la página actual.
        // ******************************************************************************
        base.calculatePage = function () {
            if (takePage > dropPage)
                actPage = actPage + 2;
            if (takePage < dropPage)
                actPage = actPage - 2;
        }

        // ******************************************************************************
        // Determina la página que se mostraría cuando se realiza la paginación
        // ******************************************************************************
        base.calculateNextPage = function () {
            if (((actPage + 2 < flipImage.length - 2) && (takePage == 1)) || ((actPage - 2 > 1) && (takePage == -1)))
                return true;
            else
                return false;
        }

        // ******************************************************************************
        // Compruebe si el mouse está dentro de alguna esquina INFERIOR de la pagina
        // ******************************************************************************
        base.isMouseInCornerDOWN = function () {
            if (
                // Define el area de los corner inferiores. (son sensibles al click del raton).
                (iWidth - Math.abs(mouseRelCenterX) < base.options.cornerSize) &&
                (iWidth - Math.abs(mouseRelCenterX) >= 0) &&
                (Math.abs(mouseRelCenterY) < base.options.cornerSize) &&
                (mouseRelCenterY <= 0)) {

                isMouseInCornerUP = false;
                isMouseInCornerDOWN = true;
                $(base.el).css('cursor', 'pointer');
                return true;

            } else {
                isMouseInCornerDOWN = false;
                isMouseInCornerUP = false;
                $(base.el).css('cursor', 'auto');
            }
        }

        // ******************************************************************************
        // Compruebe si el mouse está dentro de alguna esquina SUPERIOR de la pagina
        // ******************************************************************************
        base.isMouseInCornerUP = function () {
            if (
                // Define el area de los corner Superiores. (son sensibles al click del raton).
                (iWidth - Math.abs(mouseRelCenterX) < base.options.cornerSize) &&
                (iWidth - Math.abs(mouseRelCenterY) <= 0) &&
                (Math.abs(mouseRelCenterY) > base.options.cornerSize) &&
                (mouseRelCenterY <= 0)) {

                isMouseInCornerDOWN = false;
                isMouseInCornerUP = true;
                $(base.el).css('cursor', 'pointer');
                return true;

            } else {
                isMouseInCornerDOWN = false;
                isMouseInCornerUP = false;
                $(base.el).css('cursor', 'auto');
            }
        }

        // ******************************************************************************
        // Dibujar esquinas (son las esquinas sensibles al click del raton)
        // ******************************************************************************
        base.drawCorners = function () {
            // ------------------------------- Prueba Mia
            var cornerDivY_1 = contentY;
            var cornerDivLeftX_1 = contentX + 1.75 * iWidth - base.options.cornerSize;
            var cornerDivRightX_1 = contentX + 1.75 * iWidth ; // ...este no estoy muy seguro...

            // -------------------------------
            var cornerDivY = contentY + 0.945 * iHeight - base.options.cornerSize;
            var cornerDivLeftX = contentX;
            var cornerDivRightX = contentX + 1.75 * iWidth - base.options.cornerSize;

            var r = HexToR(base.options.cornerColor);
            var g = HexToG(base.options.cornerColor);
            var b = HexToB(base.options.cornerColor);

            ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + base.options.cornerAlpha + ')';
            ctx.beginPath();

            if (actPage > 1) // Ocultar CornerButton en la primera página
                ctx.fillRect(cornerDivLeftX, cornerDivY, base.options.cornerSize, base.options.cornerSize);
                ctx.fillRect(cornerDivLeftX_1, cornerDivY_1, base.options.cornerSize, base.options.cornerSize);
                //ctx.arc(cornerDivLeftX, cornerDivY, base.options.cornerSize, 0, 2*Math.PI, true);
            ctx.fill();
            ctx.beginPath();
            if (actPage < flipImage.length - 2)  // ocultar CornerButton en la última página (si solo se muestra el lado izquierdo)
                ctx.fillRect(cornerDivRightX, cornerDivY, base.options.cornerSize, base.options.cornerSize);
                // Este ultimo lo añadi yo,...pero no veo cambios de comportamiento...
                ctx.fillRect(cornerDivRightX_1, cornerDivY_1, base.options.cornerSize, base.options.cornerSize);
                ctx.fill();
        }

        // ******************************************************************************
        // Comprueba si se muestra la primera o la última página
        // ******************************************************************************
        base.checkFirstAndLastPage = function () {
            if (((actPage < flipImage.length - 2) && (takePage == 1)) || ((actPage > 1) && (takePage == -1)))
                return true;
            else
                return false;
        }

        // ******************************************************************************
        // Al hacer click en un corner, pinta las sombras.
        // ******************************************************************************            
        base.drawShadows = function (page) {
            // izquierda
            if (page == 'left') {
                gradient = ctx.createLinearGradient(iWidth + contentX-55, contentY , iWidth + contentX + base.options.shadowWidth-55, contentY);
                gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
                gradient.addColorStop(0, "rgba(0, 0, 0, " + base.options.shadowOpacity + ")");
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.rect(iWidth + contentX -55, contentY-5, base.options.shadowWidth, iHeight+5);
                ctx.fill();
            }
            // derecha
            if (page == 'right') {
                gradient = ctx.createLinearGradient(0.88*iWidth + contentX - base.options.shadowWidth, contentY, 0.88*iWidth + contentX, contentY);
                gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
                gradient.addColorStop(1, "rgba(0, 0, 0, " + base.options.shadowOpacity + ")");
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.rect(0.88*iWidth + contentX - base.options.shadowWidth, contentY-2, base.options.shadowWidth, iHeight);
                ctx.fill();
            }
        }

        // ******************************************************************************
        // Pinta las sobras por defecto.
        // ******************************************************************************            
        base.drawShadowsBack = function () {
            // Dibuja la sombra en el lienzo de atrás a la derecha
            if (base.options.shadowWidth > 0) {
                gradient = ctx2.createLinearGradient(iWidth + contentX-55, contentY, iWidth + contentX + base.options.shadowWidth-55, contentY);
                gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
                gradient.addColorStop(0, "rgba(0, 0, 0, " + base.options.shadowOpacity + ")");
                ctx2.fillStyle = gradient;
                ctx2.beginPath();
                ctx2.rect((iWidth + contentX)-55, contentY-5, iWidth-55, iHeight+5);
                ctx2.fill();
            }
            // Dibuja sombras en el lienzo de atrás a la izquierda
            if (base.options.shadowWidth > 0) {
                gradient = ctx2.createLinearGradient(0.88*iWidth + contentX, contentY, 0.88*iWidth + contentX - base.options.shadowWidth , contentY);
                gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
                gradient.addColorStop(0, "rgba(0, 0, 0, " + base.options.shadowOpacity + ")");
                ctx2.fillStyle = gradient;
                ctx2.beginPath();
                ctx2.rect(0.88*contentX, contentY-5, 0.88*iWidth, iHeight+5);
                ctx2.fill();
            }
        }

        // ******************************************************************************
        // Es llamado al liberar el mouse con _mouseUpInCornerDown(). 
        // Recibe el angulo calculado y finaliza la animacion a partir del angulo suministrado.
        // ****************************************************************************** 
        base.animateFlipping = function (angle_clx) {
            // eliminar todos los controladores de eventos
            //alert(angle_clx);

            $(base.el).unbind();
            window.clearTimeout(interval);

            if (mouseRelCenterY < 0)
                dynamicHelp = 20;

            if (dropPage == -1) {
                mouseRelCenterX = mouseRelCenterX - base.options.animationDynamic;
                mouseRelCenterY = Math.tan(angle_clx) * (CX - contentX) - dynamicHelp;
            }
            if (dropPage == 1) {
                mouseRelCenterX = mouseRelCenterX + base.options.animationDynamic;
                mouseRelCenterY = Math.tan(angle_clx) * Math.abs(CX - contentX - 2 * iWidth) - dynamicHelp;
            }

            // Ejecutar animación hasta que la página esté completamente vuelta.
            if ((CX - contentX > 1) && (CX - contentX < 2 * iWidth - 1)) {
                base.pageFlip();
                interval = window.setTimeout(function () { base.animateFlipping(angle_clx); }, base.options.animationSpeed);
            }
            else {
                if (dropPage == -1)
                    mouseRelCenterX = -iWidth;
                if (dropPage == 1)
                    mouseRelCenterX = iWidth;

                mouseRelCenterY = 0;
                base.calculatePage();

                // Aspecto de las Imagenes al finalizar el efecto de pasar la hoja...
                if (base.pageFlip()) {
                    ctx.clearRect(0, 0, iHeight*2, iHeight*2); // Borra el espacio y permite que se redibuje bien (incluida la sombra central).

                    if (dropPage == -1) {
                        if (flipImage[actPage - 1].nodeName == 'IMG')
                            $('#pageBackgroundLeft').html('<img style="width:95%;height:98%;margin:20;" src="' + flipImage[actPage - 1].src + '">');
                            $('#pageBackgroundLeft2').html('<img style="width:95%;height:98%;margin:20;" src="' + flipImage[actPage - 3].src + '">');

                        if (flipImage[actPage - 1].nodeName == 'VIDEO') {
                            $('#pageBackgroundLeft').html(base.drawVideo(actPage - 1));
                            $('#pageBackgroundLeft2').html(base.drawVideo(actPage - 3));
                        }

                        if (flipImage[actPage - 1].nodeName == 'AUDIO') {
                            $('#pageBackgroundLeft').html(base.drawAudio(actPage - 1));
                            $('#pageBackgroundLeft2').html(base.drawAudio(actPage - 3));
                        }
                    }

                    if (dropPage == 1) {
                        
                        if (flipImage[actPage].nodeName == 'IMG')
                            $('#pageBackgroundRight').html('<img style="width:100%;height:98%;" src="' + flipImage[actPage].src + '">');
                            $('#pageBackgroundRight2').html('<img style="width:100%;height:98%;" src="' + flipImage[actPage + 2].src + '">');

                        if (flipImage[actPage].nodeName == 'VIDEO') {
                            $('#pageBackgroundRight').html(base.drawVideo(actPage));
                            $('#pageBackgroundRight2').html(base.drawVideo(actPage + 2));
                        }

                        if (flipImage[actPage].nodeName == 'AUDIO') {
                            $('#pageBackgroundRight').html(base.drawAudio(actPage));
                            $('#pageBackgroundRight2').html(base.drawAudio(actPage + 2));
                        }
                    }
                    $(base.el).bind({ mousemove: function (event) { base.mouseMove(event) } });
                    $(base.el).bind({ mousedown: function (event) { base._mouseDown(event) } });
                    $(base.el).bind({ mouseup: function (event) { base._mouseUpInCornerDown(event) } }); //Soltar raton que seleccionó en corner inferior
                    $(base.el).bind({ mouseup: function (event) { base._mouseUpInCornerUp(event) } });   //Soltar raton que seleccionó en corner superior
                }
                // Calcule la posición relativa del mouse (se necesita nuevo valor de y, si mira en la esquina nuevamente sin mouseMove)
                base.calcRelMousePos();
                base.debugDraw();
            }
        }

        



        //#region Pruebas varias (Guardadas aqui pero que no se usan)

        // Crea el link necesario para referenciar al CSS
        // importarCSS("js/jPageFlip-0.9.7/css/style.css");
        function importarCSS(nombre, callback) {
            var s = document.createElement("link");
            s.onload = callback;
            s.type = "text/css";
            s.href = nombre;
            s.rel = "stylesheet"
            document.querySelector("head").appendChild(s);
        }
        //#endregion

        
        //#region Debug (Lo usaba el programador para debugar el programa)
        base.debugDraw = function () {
            // Radius 1 (innen)
            // Punkt zeichnen (lila)
            r1x = iWidth * (Math.cos(Math.atan(mouseRelCenterY / mouseRelCenterX)));
            //alert(r1x);
            r1y = iWidth * Math.abs((Math.sin(Math.atan(mouseRelCenterY / mouseRelCenterX))));
            if (mouseRelCenterX < 0)
                r1x = r1x * -1;
            if (mouseRelCenterY < 0)
                r1y = r1y * -1;

            // puntos auxiliares
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255,0,0,1)'; //rojo
            ctx.arc(CX, CY, 20, 0, 360, false);
            ctx.fill();
            ctx.beginPath();

            ctx.fillStyle = 'rgba(0,0,0,1)'; //negro
            ctx.arc(mouseAbsX, mouseAbsY, 10, 0, 360, false);
            ctx.fill();
            ctx.beginPath();

            ctx.fillStyle = 'rgba(125,120,0,1)'; //amarillo
            ctx.arc(CX, CY, 10, 0, 360, false);
            ctx.fill();
            ctx.beginPath();

            ctx.fillStyle = 'rgba(15,120,50,1)'; //verde
            ctx.arc(innerMx + r2x, r2y + contentY, 10, 0, 360, false);
            ctx.fill();
            ctx.beginPath();

            ctx.fillStyle = 'rgba(250,0,240,1)'; //lila
            ctx.arc(innerMx + r1x, iHeight + r1y + contentY, 10, 0, 360, false);
            ctx.fill();
            ctx.beginPath();

            ctx.fillStyle = 'rgba(80,80,80,1)'; //esquina gris a la derecha
            if (takePage == 1)
                ctx.arc(innerMx + iWidth, iHeight + contentY, 30, 0, 360, false);
            else
                ctx.arc(innerMx - iWidth, iHeight + contentY, 30, 0, 360, false);
            ctx.fill();
            ctx.beginPath();

            ctx.fillStyle = 'rgba(0,150,204,1)'; //azul
            ctx.arc(T1X, T1Y, 5, 0, 360, false);
            ctx.fill();
            ctx.beginPath();

            ctx.fillStyle = 'rgba(0,250,204,1)'; //turquesa
            ctx.arc(T2X, T2Y, 5, 0, 360, false);
            ctx.fill();

            // Hilfslinien
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(mouseAbsX, mouseAbsY);
            ctx.lineTo(innerMx, innerMy + contentY);
            ctx.moveTo(mouseAbsX, mouseAbsY);
            ctx.lineTo(outerMx, outerMy + contentY);
            ctx.moveTo(CX, CY);
            ctx.lineTo(outerMx, outerMy + contentY);
            if (takePage == 1)
                ctx.moveTo(innerMx + iWidth, iHeight + contentY); //esquina gris
            else
                ctx.moveTo(innerMx - iWidth, iHeight + contentY); //esquina gris
            ctx.lineTo(CX, CY); //imagen de la esquina
            ctx.stroke();

            //Círculo externo e interno
            ctx.beginPath()
            ctx.fillStyle = 'rgba(123,24,255,0.1)';
            ctx.arc(innerMx, innerMy + contentY, iWidth, 0, 360, false);
            ctx.fill();
            ctx.beginPath()

            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.arc(outerMx, outerMy + contentY, outerRadius, 0, 360, false);
            ctx.fill();
        }

        function debugValue() {
            // resultado de la depuración
            $('#debug01').val(CX);
            $('#debug02').val(CY);
            $('#debug03').val(T2X);
            $('#debug04').val(flipImage.length - 1);
            $('#debug05').val(angleClip);
        }
        //#endregion



        /*************************************************************/
        /* Propiedad que expone la pagina actual                     */
        /*************************************************************/
        $.fn.getActPage = function () {
            return actPage;
        }


        /*************************************************************/
        /* Inicializa                                      */
        /*************************************************************/
        base.init();

    };

    // jPageFlip definido aqui permite utilizar $('#myPageFlip').jPageFlip({... 
    // en la llamada desde el html
    // https://learn.jquery.com/plugins/basic-plugin-creation/
    $.fn.jPageFlip = function (options) {
        
        return this.each(function () {
            (new $.jPageFlip(this, options));
        });
    };

    // Propiedad creo que devuelve el objeto jPageFlip
    $.fn.getjPageFlip = function () {
        
        return this.data("jPageFlip");
    };
    })(jQuery);



//#region Funciones conversion de colores de Hexadecimal a RGB

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Estas funciones leen el codigo hexadecimal del color de los corners.
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function HexToR(h) { return parseInt((cutHex(h)).substring(0, 2), 16) }
function HexToG(h) { return parseInt((cutHex(h)).substring(2, 4), 16) }
function HexToB(h) { return parseInt((cutHex(h)).substring(4, 6), 16) }
function cutHex(h) { return (h.charAt(0) == "#") ? h.substring(1, 7) : h }
//#endregion



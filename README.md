# jpageFlip
Añadir nuevas funcionalidades a jPageFlip

# Objetivo

Añadir nuevas funcionalidades al plugin jPageFlip 0.9.7.


# Estado actual

Por el momento he añadir la posibilidad de leer documentos PDF y mostrarlos utilizando el plugin.
El tratamiento de archivos PDF se realiza desde Pdf.js.

# Otras funcionalidades que desaria añadir

   01 - Debe trabajar igual que las imagenes, cargan documentos completos de archivos PDF.
   02 - Debe permitir pasar las paginas pulsando las teclas de fechas a derecha e izquierda.
   03 - Debe permitir hacer Zoom del libro utilizando la ruleta del raton o las teclas arriba & abajo.
   04 - Debe permitir pasar paginas haciendo click en las esquinas superiores de la pagina con el efecto adecuado.
   05 - Debe permitir ir a una pagina concreta introducida por el usuario "Ir a..."
   06 - Debe permitir Imprimir una pagina o varias.
   07 - Debe permitir Descargar el archivo PDF en el ordenador local.
   08 - Seria muy interesante disponer de un Roll de paginas para poder seleccionar la pagina a la que ir
   09 - Debe permitir seleccionar un archo o una fotografia
   10 - DEbe mostrar un loader mientras se produce la carga de las paginas.
   11 - Debe hacer un sonido de pasa pagina al pasar la pagina.

****************************************************************************

2019-02-16 - Ahora si que ya pasa las paginas. Faltas ajustar milimetricamente para que no se perciba el click al seleccionar
			 la pagina. Y faltan las sombras....

2019-02-16 - Ahora ya pasan bien las paginas en ambos sentidos. Me falta añadir sombras centrales y que al agarrar
			 una hoja el tamño de esta sea igual que el de las hojas del libro.

2019-02-13 - He realizado limpieza de elementos innecesarios.

2019-02-13 - Añadido fondo del libro que se redimensiona con el conjunto del libro (parecido al efecto de zoom).

2019-02-13 - He añadido un nuevo loader que incorpora progresion en circulo y % de carga
			 https://www.jqueryscript.net/loading/jQuery-Circular-Progress-Bar-With-Text-Counter.html

2019-02-09 - He añadido la logica para que añada la porta y la contraportada. Si el numero de paginas en el documento cargado
			 es par, entonces pone la portada y la contraportada. Si el numero de paginas es IMPAR entonces debe añadir una pagina
			 en blanco al final del documento y esta pagina blanca aparece junto a la contraportada.

2019-02-07 - El documento PDF se carga correctamente y las imagenes tambien.

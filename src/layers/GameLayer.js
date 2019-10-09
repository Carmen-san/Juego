class GameLayer extends Layer {

    constructor() {
        super();
        this.iniciar();
    }

    iniciar() {
        reproducirMusica();

        this.espacio = new Espacio(1);

        this.scrollX = 0;
        this.puntos = this.puntos = new Texto(0,480*0.9,320*0.07 );
        this.fondoPuntos = new Fondo(imagenes.icono_puntos, 480*0.85,320*0.05)

        this.fondo = new Fondo(imagenes.fondo_2,480*0.5,320*0.5);

        this.disparosJugador = []

        this.enemigos = [];

        this.bloques = [];

        this.cargarMapa("res/0.txt");
    }

    actualizar (){
        // Jugador se cae
        if ( this.jugador.y > 320 ){
            this.iniciar();
        }

        this.espacio.actualizar();
        this.fondo.vx = -1;
        this.fondo.actualizar();

        console.log("disparosJugador: "+this.disparosJugador.length)

        // Eliminar disparos sin velocidad
        for (var i=0; i < this.disparosJugador.length; i++){
            if ( this.disparosJugador[i] != null &&
                this.disparosJugador[i].vx == 0){

                this.espacio
                    .eliminarCuerpoDinamico(this.disparosJugador[i]);
                this.disparosJugador.splice(i, 1);
            }
        }

        // Eliminar disparos fuera de pantalla
        for (var i=0; i < this.disparosJugador.length; i++){
            if ( this.disparosJugador[i] != null &&
                !this.disparosJugador[i].estaEnPantalla()){

                this.espacio.eliminarCuerpoDinamico(this.disparosJugador[i]);
                this.disparosJugador.splice(i, 1);
                i=i-1;
            }
        }

        this.jugador.actualizar();
        for (var i=0; i < this.enemigos.length; i++){
            this.enemigos[i].actualizar();
        }

        for (var i=0; i < this.disparosJugador.length; i++) {
            this.disparosJugador[i].actualizar();
        }


        // colisiones
        for (var i=0; i < this.enemigos.length; i++){
            if ( this.enemigos[i].colisiona(this.jugador)){
                this.iniciar();
            }
        }

        // colisiones , disparoJugador - Enemigo
        for (var i=0; i < this.disparosJugador.length; i++){
            for (var j=0; j < this.enemigos.length; j++){
                if (this.disparosJugador[i] != null &&
                    this.enemigos[j] != null &&
                    this.disparosJugador[i].colisiona(this.enemigos[j])) {

                    this.espacio.eliminarCuerpoDinamico(this.disparosJugador[i]);
                    this.disparosJugador.splice(i, 1);
                    i = i-1;
                    this.enemigos[j].impactado();
                    this.puntos.valor++;
                }
            }
        }

        // Enemigos muertos fuera del juego
        for (var j=0; j < this.enemigos.length; j++){
            if ( this.enemigos[j] != null &&
                this.enemigos[j].estado == estados.muerto  ) {

                this.espacio.eliminarCuerpoDinamico(this.disparosJugador[i]);
                this.enemigos.splice(j, 1);
                j = j-1;
            }
        }

    }

    dibujar (){
        this.calcularScroll();

        this.fondo.dibujar();
        for (var i=0; i < this.bloques.length; i++){
            this.bloques[i].dibujar(this.scrollX);
        }

        for (var i=0; i < this.disparosJugador.length; i++) {
            this.disparosJugador[i].dibujar(this.scrollX);
        }

        for (var i=0; i < this.enemigos.length; i++) {
            this.enemigos[i].dibujar(this.scrollX);
        }

        this.jugador.dibujar(this.scrollX);
        this.fondoPuntos.dibujar();
        this.puntos.dibujar();
    }

    procesarControles( ){
        // disparar
        if (  controles.disparo ){
            var nuevoDisparo = this.jugador.disparar();
            if ( nuevoDisparo != null ) {
                this.espacio.agregarCuerpoDinamico(nuevoDisparo);
                this.disparosJugador.push(nuevoDisparo);
            }
        }

        // Eje X
        if ( controles.moverX > 0 ){
            this.jugador.moverX(1);

        }else if ( controles.moverX < 0){
            this.jugador.moverX(-1);

        } else {
            this.jugador.moverX(0);
        }

        // Eje Y
        if ( controles.moverY > 0 ){
            this.jugador.saltar();
        } else if ( controles.moverY < 0 ){

        } else {
        }
    }


    cargarMapa(ruta){
        var fichero = new XMLHttpRequest();
        fichero.open("GET", ruta, false);

        fichero.onreadystatechange = function () {
            var texto = fichero.responseText;
            var lineas = texto.split('\n');
            this.anchoMapa = (lineas[0].length-1) * 40;
            for (var i = 0; i < lineas.length; i++){
                var linea = lineas[i];
                for (var j = 0; j < linea.length; j++){
                    var simbolo = linea[j];
                    var x = 40/2 + j * 40; // x central
                    var y = 32 + i * 32; // y de abajo
                    this.cargarObjetoMapa(simbolo,x,y);
                }
            }
        }.bind(this);

        fichero.send(null);
    }

    cargarObjetoMapa(simbolo, x, y){
        switch(simbolo) {
            case "1":
                this.jugador = new Jugador(x, y);
                // modificación para empezar a contar desde el suelo
                this.jugador.y = this.jugador.y - this.jugador.alto/2;
                this.espacio.agregarCuerpoDinamico(this.jugador);
                break;
            case "#":
                var bloque = new Bloque(imagenes.bloque_tierra, x,y);
                bloque.y = bloque.y - bloque.alto/2;
                // modificación para empezar a contar desde el suelo
                this.bloques.push(bloque);
                this.espacio.agregarCuerpoEstatico(bloque);
                break;
            case "x":
                var bloque = new Bloque(imagenes.bloque_metal, x,y);
                bloque.y = bloque.y - bloque.alto/2;
                // modificación para empezar a contar desde el suelo
                this.bloques.push(bloque);
                break;
            case "E":
                var enemigo = new Enemigo(x,y);
                enemigo.y = enemigo.y - enemigo.alto/2;
                // modificación para empezar a contar desde el suelo
                this.enemigos.push(enemigo);
                this.espacio.agregarCuerpoDinamico(enemigo);
                break;
        }
    }

    calcularScroll() {
        if (this.jugador.x > 480 * 0.3) {
            if (this.jugador.x - this.scrollX < 480 * 0.3) {
                this.scrollX = this.jugador.x - 480 * 0.3;
            }
        }

        // limite derecha
        if (this.jugador.x < this.anchoMapa - 480 * 0.3) {
            if (this.jugador.x - this.scrollX > 480 * 0.7) {
                this.scrollX = this.jugador.x - 480 * 0.7;
            }
        }
    }
}

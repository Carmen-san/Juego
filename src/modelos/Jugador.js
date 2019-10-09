class Jugador extends Modelo {

    constructor(x, y) {
        super(imagenes.jugador , x, y)
        this.estado = estados.moviendo;
        this.orientacion = orientaciones.derecha;
        this.vx = 0; // velocidadX
        this.vy = 0; // velocidadY

        this.cadenciaDisparo = 30;
        this.tiempoDisparo = 0;

        // Animaciones
        this.aDispararDerecha = new Animacion(imagenes.jugador_disparando_derecha,
            this.ancho, this.alto,6,4,this.finAnimacionDisparar.bind(this) );
        // No pasar funciones del DIRECTAMNTE COMO callback
        // El objeto que ejecute la función no sabrá interpretar el "this."

        this.aDispararIzquierda = new Animacion(imagenes.jugador_disparando_izquierda,
            this.ancho,this.alto,6,4,this.finAnimacionDisparar.bind(this));

        this.aIdleDerecha = new Animacion(imagenes.jugador_idle_derecha,
            this.ancho, this.alto, 6, 8);
        this.aIdleIzquierda = new Animacion(imagenes.jugador_idle_izquierda,
            this.ancho, this.alto, 6, 8);
        this.aCorriendoDerecha =
            new Animacion(imagenes.jugador_corriendo_derecha,
                this.ancho, this.alto, 6, 8);
        this.aCorriendoIzquierda = new Animacion(imagenes.jugador_corriendo_izquierda,
            this.ancho, this.alto, 6, 8);

        this.animacion = this.aIdleDerecha;
    }

    actualizar(){
        this.animacion.actualizar();

        if (this.choqueAbajo == true){
            this.enElAire = false;
        } else {
            this.enElAire = true;
        }

        if ( this.vx > 0 ){
            this.orientacion = orientaciones.derecha;
        }
        if ( this.vx < 0 ){
            this.orientacion = orientaciones.izquierda;
        }

        switch (this.estado){
            case estados.disparando:
                if (this.orientacion == orientaciones.derecha) {
                    this.animacion = this.aDispararDerecha;
                }
                if (this.orientacion == orientaciones.izquierda) {
                    this.animacion = this.aDispararIzquierda;
                }
                break;
            case estados.moviendo:
                if ( this.vx != 0 ) {
                    if (this.orientacion == orientaciones.derecha) {
                        this.animacion = this.aCorriendoDerecha;
                    }
                    if (this.orientacion == orientaciones.izquierda) {
                        this.animacion = this.aCorriendoIzquierda;
                    }
                }
                if ( this.vx == 0){
                    if (this.orientacion == orientaciones.derecha) {
                        this.animacion = this.aIdleDerecha;
                    }
                    if (this.orientacion == orientaciones.izquierda) {
                        this.animacion = this.aIdleIzquierda;
                    }
                }
                break;
        }

        if ( this.tiempoDisparo > 0 ) {
            this.tiempoDisparo--;
        }
    }

    moverX (direccion){
        this.vx = direccion * 3;
    }

    moverY (direccion){
        this.vy = direccion * 3;
    }

    disparar(){

        if ( this.tiempoDisparo == 0) {
            this.estado = estados.disparando;
            // reiniciar Cadencia
            reproducirEfecto(efectos.disparo)
            this.tiempoDisparo = this.cadenciaDisparo;

            var disparo = new DisparoJugador(this.x, this.y);
            if ( this.orientacion == orientaciones.izquierda ){
                disparo.vx = disparo.vx*-1; //invertir
            }
            return disparo;

        } else {
            return null;
        }
    }

    dibujar (scrollX = 0){
        this.animacion.dibujar(this.x - scrollX, this.y);
    }

    finAnimacionDisparar(){
        this.estado = estados.moviendo;
    }

    saltar(){
        if ( !this.enElAire ) {
            this.vy = -16;
            this.enElAire = true;
        }
    }
}

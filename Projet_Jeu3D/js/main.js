// Variables du jeu
var jeu;
var tempsDelta = 0;
var tempsNouveau = new Date().getTime();
var tempsAncien = new Date().getTime();
var obstaclesPool = [];
var particulesPool = [];
var particulesUtilisees = [];

function resetJeu(){
  jeu = {vitesse: 0,
          vitesseInit: 0.00036,
          vitesseDeBase: 0.00036,
          cibleBaseVitesse: 0.00036,
          incremVitesseTemps: 0.0000026,
          incremVitesseNiveau: 0.000006,
          distanceVitesseMaj: 100,
          vitesseDerniereMaj: 0,

          distance: 0,
          retioVitDist: 49,
          energie: 100,
          ratioVitNrj: 2.99,

          niveau: 1,
          niveauDerniereMaj: 0,
          distanceNiveauMaj: 1000,

          fueseeTailleDefault: 105,
          fuseeAmplitudeHauteur: 75,
          fuseeAmplitudeLargeur: 70,
          fuseeVitesseDestruction: 0.0009,
          fuseeVitesseBase: 0,
          fuseeCollisionX: 0,
          fuseeCollisionVitesseX: 0,

          fuseeCollisionY: 0,
          fuseeCollisionVitesseY: 0,

          terreRayon: 550,
          terreLongueur: 750,

          carburantDerniereApparition: 0,
          obstacleDerniereApparition: 0,
		 
          etat : "jouer",
         };
	
  niveauPlatforme.innerHTML = Math.floor(jeu.niveau);
}

//Variables Three.js

var paysage;
var camera, createur;
var bac;

//Variables pour écran/souris

var hauteur, largeur;
var posSouris = { x: 0, y: 0 };

//Initialisation écran, souris et three.js

function creerPaysage() {
	hauteur = window.innerHeight;
	largeur = window.innerWidth;

	paysage = new THREE.Scene();
	paysage.fog = new THREE.Fog(0xF7D9BA, 100, 950);
	
	camera = new THREE.PerspectiveCamera( 70, largeur / hauteur, 1 , 20000 );
	
  
	camera.position.x = 0;
	camera.position.z = 250;
	camera.position.y = jeu.fueseeTailleDefault;

	createur = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	createur.setSize(largeur, hauteur);
	createur.shadowMap.enabled = true;

	bac = document.getElementById( 'world' );
	bac.appendChild(createur.domElement);

	window.addEventListener('resize', RedimensionnerFenetre, false);

}

// Si Redimmensionnement de la fenetre

function RedimensionnerFenetre() {
  hauteur = window.innerHeight;
  largeur = window.innerWidth;
	
  createur.setSize(largeur, hauteur);
	
  camera.aspect = largeur / hauteur;
  camera.updateProjectionMatrix();
}

//Evènement Souris

function deplacementSouris(evenement) {
	var sx = -1 + (evenement.clientX / largeur)*2;
	var sy = 1 - (evenement.clientY / hauteur)*2;
	posSouris = {x:sx, y:sy};
}

function deplacementClick(evenement) {
    evenement.prevenementDefault();
    var sx = -1 + (evenement.touches[0].pageX / largeur)*2;
    var sy = 1 - (evenement.touches[0].pageY / hauteur)*2;
    posSouris = {x:sx, y:sy};
}

function deplacementSourisHaut(evenement){
	if (jeu.etat == "attenteRejouer"){
		resetJeu();
		cacherRejouer();
	}
}


function deplacementClickFin(evenement){
	if (jeu.etat == "attenteRejouer") {
		resetJeu();
		cacherRejouer();
	}
}

// Lumière

var generalLum, espaceLum, ombreLum;

function creeLumiere() {
	
	espaceLum = new THREE.HemisphereLight( 0xBAAABA , 0x100001 , .91 )
	generalLum = new THREE.AmbientLight( 0xFFFFCF , .39);

	ombreLum = new THREE.DirectionalLight( 0xFFFFFF , .91 );
	ombreLum.position.set ( 149 , 349 , 349 );
	ombreLum.castShadow = true;
	ombreLum.shadow.camera.left = -399;
	ombreLum.shadow.camera.right = 399;
	ombreLum.shadow.camera.top = 399;
	ombreLum.shadow.camera.bottom = -399;
	ombreLum.shadow.camera.near = 1;
	ombreLum.shadow.camera.far = 990;
	ombreLum.shadow.mapSize.width = 4096;
	ombreLum.shadow.mapSize.height = 4096;
	paysage.add(espaceLum);
	paysage.add(ombreLum);
	paysage.add(generalLum);
}


var Astronaute = function() {
	
	this.mesh = new THREE.Object3D();
	this.mesh.name = "astronaute";
	this.cheveuxAngle = 0;

	var corps = new THREE.Mesh ( new THREE.BoxGeometry ( 16 , 16 , 16 ) , new THREE.MeshPhongMaterial ( {
        color : 0x59332E ,
        shading : THREE.FlatShading
    } ) );

    corps.position.set ( 19 , 3 , 0 );
    this.mesh.add ( corps );

	var geomTete = new THREE.BoxGeometry( 9 , 9 , 9 );
	var matériauxTete = new THREE.MeshLambertMaterial({color:0xF5986E});
	var tete = new THREE.Mesh(geomTete, matériauxTete);
	tete.position.set ( 20 , 15 , 0 );
	this.mesh.add(tete);

	var geomCheveu = new THREE.BoxGeometry( 5 , 5 , 5 );
	var materiauxCheveu = new THREE.MeshLambertMaterial({color : 0x59333E});
	var cheveu = new THREE.Mesh(geomCheveu, materiauxCheveu);
	cheveu.geometry.applyMatrix(new THREE.Matrix4().makeTranslation( 0 , 3 , 0 ));
	var cheveux = new THREE.Object3D();
	this.cheveuxHaut = new THREE.Object3D();

	for (var i = 0; i < 11 ; i ++ ) {
		var clone = cheveu.clone();
		var colonne = i % 3;
		var ligne = Math.floor(i / 3);
		var positionZ = - 3;
		var positionX = - 3;
		clone.position.set(positionX + ligne * 4, 0, positionZ + colonne * 4);
		clone.geometry.applyMatrix(new THREE.Matrix4().makeScale( 1 , 1 , 1 ));
		this.cheveuxHaut.add( clone );
	}
	cheveux.add( this.cheveuxHaut );

	var geomCheveuxCote = new THREE.BoxGeometry( 12 , 4 , 2 );
	geomCheveuxCote.applyMatrix(new THREE.Matrix4().makeTranslation( -6 , 0 , 0 ));
	var cheveuxCoteDroit = new THREE.Mesh(geomCheveuxCote, materiauxCheveu);
	var cheveuxCoteGauch = cheveuxCoteDroit.clone();
	
	cheveuxCoteDroit.position.set( 7 , -2 , 6 );
	cheveuxCoteGauch.position.set( 7 , -2 , -6 );
	
	cheveux.add(cheveuxCoteDroit);
	cheveux.add(cheveuxCoteGauch);

	var geomCheveuxDos = new THREE.BoxGeometry( 2 , 8 , 9 );
	var cheveuDos = new THREE.Mesh( geomCheveuxDos , materiauxCheveu );
	cheveuDos.position.set( -1 , -4 , 0 )
	cheveux.add( cheveuDos );
	cheveux.position.set( 15 , 20 , 0 );
	
	this.mesh.add(cheveux);

	var geomLunette = new THREE.BoxGeometry( 4 , 4 , 4 );
	var materiauxLunette = new THREE.MeshLambertMaterial({ color : 0x23190f });
	
	var lunetteDroite = new THREE.Mesh(geomLunette,materiauxLunette);
	lunetteDroite.position.set( 25 , 15 , 3 );
	var lunetteGauche = lunetteDroite.clone();
	lunetteGauche.position.z = -lunetteDroite.position.z

	var geomLunetteAvant = new THREE.BoxGeometry( 11 , 1 , 11 );
	var lunetteAvant = new THREE.Mesh(geomLunetteAvant, materiauxLunette);
	this.mesh.add( lunetteDroite );
	this.mesh.add( lunetteGauche );
	this.mesh.add( lunetteAvant );
	
	var geomOreille = new THREE.BoxGeometry( 2 , 2 , 2 );
	var oreilleGauche = new THREE.Mesh( geomOreille , matériauxTete );
	oreilleGauche.position.set( 20 , 0 , -6 );
	var oreilleDroite = oreilleGauche.clone();
	oreilleDroite.position.set( 20 , 15 , 6 );
	this.mesh.add(oreilleGauche);
	this.mesh.add(oreilleDroite);
}

Astronaute.prototype.majCheveux = function() {
	var cheveux = this.cheveuxHaut.children;

	for (var i = 0; i < cheveux.length ; i++) {
		var chev = cheveux[i];
		chev.scale.y = .74 + Math.cos(this.cheveuxAngle + i/3) * .24;
	}
	this.cheveuxAngle += jeu.vitesse*tempsDelta * 40;
}

// Creation de notre Fusée

var FuseeEspace = function() {
	this.mesh = new THREE.Object3D();

	// Cabine
	var cabineGeom = new THREE.BoxGeometry ( 180 , 60 , 55 , 1 , 1 , 1 );
	var cabineMateriaux = new THREE.MeshPhongMaterial({ color : 0xC0C0C0, shading:THREE.FlatShading});

	var cabine = new THREE.Mesh(cabineGeom, cabineMateriaux);
	cabine.castShadow = true;
	cabine.receiveShadow = true;
	this.mesh.add(cabine);

	// Tête Fusée

	var enginGeom = new THREE.BoxGeometry ( 60 , 40 , 40 , 1 , 1 , 1 );
	var enginMateriaux = new THREE.MeshPhongMaterial({ color : 0xF25346 , shading:THREE.FlatShading});
  
	enginGeom.vertices[ 4 ].y += 10;
    enginGeom.vertices[ 4 ].z -= 10;
    enginGeom.vertices[ 5 ].y += 10;
    enginGeom.vertices[ 5 ].z += 10;
    enginGeom.vertices[ 6 ].y -= 10;
    enginGeom.vertices[ 6 ].z -= 10;
    enginGeom.vertices[ 7 ].y -= 10;
    enginGeom.vertices[ 7 ].z += 10;
	
	var engin = new THREE.Mesh(enginGeom, enginMateriaux);
	engin.position.x = 120;
	engin.castShadow = true;
	engin.receiveShadow = true;
	this.mesh.add( engin );

	// Queue Fusée

	var fuseeQueueGeom = new THREE.BoxGeometry ( 20 , 20 , 5 , 1 , 1 , 1 );
	var fuseeQueueMateriaux = new THREE.MeshPhongMaterial({color : 0x49494A, shading:THREE.FlatShading});
	var fuseeQueue = new THREE.Mesh(fuseeQueueGeom, fuseeQueueMateriaux);
	fuseeQueue.position.set ( - 100 , 0 , 0 );
	fuseeQueue.castShadow = true;
	fuseeQueue.receiveShadow = true;
	this.mesh.add(fuseeQueue);

	// Création Coupe-Vent
	
	var coupeVentGeom = new THREE.BoxGeometry ( 40 , 35 , 20 , 1 , 1 , 1 );
    var coupeVentMateriaux = new THREE.MeshPhongMaterial ( {
        color : 0xD8D0D1 ,
        transparent : true ,
        opacity : .2 ,
        shading : THREE.FlatShading
    } );
    ;
		
	var coupeVent = new THREE.Mesh ( coupeVentGeom , coupeVentMateriaux );
    coupeVent.position.set ( 10 , 37 , 0 );

    coupeVent.castShadow = true;
    coupeVent.receiveShadow = true;

    this.mesh.add ( coupeVent );
	
	this.astronaute = new Astronaute();
	this.astronaute.mesh.position.set( -10 , 27 , 0 );
	this.mesh.add(this.astronaute.mesh);

	this.mesh.castShadow = true;
	this.mesh.receiveShadow = true;

};

// Conception Espace

Espace = function() {
	this.mesh = new THREE.Object3D();
	this.nbNuage = 21;
	this.nuages = [];
	
	var stepAngle = Math.PI * 2 / this.nbNuage;
	
	for(var i = 0; i < this.nbNuage; i++){
		var nuage = new Nuage();
		this.nuages.push(nuage);
		var angle = stepAngle*i;
		var hauteur = jeu.terreRayon + 150 + Math.random() * 199;
		
		nuage.mesh.position.y = Math.sin(angle) * hauteur;
		nuage.mesh.position.x = Math.cos(angle) * hauteur;
		nuage.mesh.position.z = - 300 - Math.random() * 500;
		nuage.mesh.rotation.z = angle + Math.PI/2;
		
		var n = 1+Math.random() * 2;
		nuage.mesh.scale.set( n , n , n );
		this.mesh.add(nuage.mesh);
	}
}

Espace.prototype.bougerNuages = function() {
	for(var i = 0; i < this.nbNuage; i++){
		var nuage = this.nuages[i];
		nuage.rotate();
	}
	this.mesh.rotation.z += jeu.vitesse * tempsDelta;
}

//Conception Terre

Terre = function(){
	var cercle = new THREE.CylinderGeometry(jeu.terreRayon, jeu.terreRayon, jeu.terreLongueur, 39 , 9 );
	cercle.applyMatrix ( new THREE.Matrix4 ().makeRotationX ( - Math.PI / 2 ) );
    cercle.mergeVertices ();
	var longueur = cercle.vertices.length;

	this.montagne = [];

	for (var i = 0; i < longueur; i++){
		var mont = cercle.vertices[i];
		this.montagne.push ( {
			y : mont.y,
            x : mont.x,
            z : mont.z,
            angle : Math.random() * Math.PI * 2,
            nombre: 5 + Math.random()*15,
            vitesse: 0.001 + Math.random()*0.002
         } );
	};
	var materiaux = new THREE.MeshPhongMaterial({
		color : 0x2E9F29 ,
		transparent : true,
		opacity : .9,
		shading : THREE.FlatShading,
		
	});

	this.mesh = new THREE.Mesh( cercle , materiaux );
	this.mesh.receiveShadow = true;

}

Terre.prototype.montagneDynamique = function (){
	var sommets = this.mesh.geometry.vertices;
	var longueur = sommets.length;
	
	for (var i=0; i < longueur; i++){
		var vect = sommets[i];
		var vectProp = this.montagne[i];
		
		vect.x = vectProp.x + Math.cos ( vectProp.angle ) * vectProp.nombre;
        vect.y = vectProp.y + Math.sin ( vectProp.angle ) * vectProp.nombre;
        vectProp.angle += vectProp.vitesse;
		
		this.mesh.geometry.verticesNeedUpdate=true;
	}
}

// Conception Nuage

Nuage = function() {
	this.mesh = new THREE.Object3D();
	
	var cube = new THREE.CubeGeometry( 20 , 20 , 20 );
	var materiaux = new THREE.MeshPhongMaterial({ color:0xd8d0d1, });
	var nombre = 3 + Math.floor ( Math.random () * 4 );
	
    for ( var y = 0 ; y < nombre ; y ++ ) {
        var mat = new THREE.Mesh ( cube.clone () , materiaux );
		
        mat.position.x = y * 15;
        mat.position.y = Math.random () * 9;
        mat.position.z = Math.random () * 9;
        mat.rotation.z = Math.random () * Math.PI * 3;
        mat.rotation.y = Math.random () * Math.PI * 2;
		
        var alea = .1 + Math.random () * .9;
		
        mat.scale.set ( alea , alea , alea );
        mat.castShadow = true;
        mat.receiveShadow = true;
        this.mesh.add ( mat );

	}
}

Nuage.prototype.rotate = function() {
	var longueur = this.mesh.children.length;
	for(var i = 0; i < longueur; i++){
		var mat = this.mesh.children[i];
		
		mat.rotation.z += Math.random()* .005 * (i + 1);
		mat.rotation.y += Math.random()* .002 * (i + 1);
	}
}

//Création Astéroïde

Asteroide = function() {
	var sphere = new THREE.TetrahedronGeometry( 8 , 2 );
	var materiaux = new THREE.MeshPhongMaterial({ 
		color: 0x404040,
		shininess: 0,
		specular:0x404040,
		shading:THREE.FlatShading
	});
	this.mesh = new THREE.Mesh(sphere,materiaux);
	this.mesh.castShadow = true;
	this.angle = 0;
	this.dist = 0;
}

AsteroideH = function () {
	this.mesh = new THREE.Object3D();
	this.asteroidesUtilisees = [];
}

AsteroideH.prototype.asteroideApparition = function() {
	var nbreAsteroide = jeu.niveau;

	for (var i = 0; i < nbreAsteroide; i++) {
		var asteroide;
		if (obstaclesPool.length) {
			asteroide = obstaclesPool.pop();
		}else{
			asteroide = new Asteroide();
		}

		asteroide.angle = - (i * 0.1);
		asteroide.distance = jeu.terreRayon + jeu.fueseeTailleDefault + (-1 + Math.random() * 2) * (jeu.fuseeAmplitudeHauteur - 20);
		asteroide.mesh.position.y = - jeu.terreRayon + Math.sin(asteroide.angle) * asteroide.distance;
		asteroide.mesh.position.x = Math.cos(asteroide.angle) * asteroide.distance;

		this.mesh.add(asteroide.mesh);
		this.asteroidesUtilisees.push(asteroide);
	}
}

AsteroideH.prototype.asteroideRotation = function() {
	for (var i = 0; i < this.asteroidesUtilisees.length; i++) {
		var asteroide = this.asteroidesUtilisees[i];
		asteroide.angle += jeu.vitesse*tempsDelta * 0.5;

		if (asteroide.angle > Math.PI*2) asteroide.angle -= Math.PI * 2;

		asteroide.mesh.position.y = - jeu.terreRayon + Math.sin(asteroide.angle) * asteroide.distance;
		asteroide.mesh.position.x = Math.cos(asteroide.angle) * asteroide.distance;
		asteroide.mesh.rotation.z += Math.random() * .1;
		asteroide.mesh.rotation.y += Math.random() * .1;

		var positionDifferente = fusee.mesh.position.clone().sub(asteroide.mesh.position.clone());
		var diff = positionDifferente.length();
		
		if (diff < 10){
			particulesH.particulesApparition(asteroide.mesh.position.clone(), 15, 0x404040, 3);
			obstaclesPool.unshift(this.asteroidesUtilisees.splice(i, 1)[0]);
			this.mesh.remove(asteroide.mesh);
			
			jeu.fuseeCollisionVitesseX = 100 * positionDifferente.x / diff;
			jeu.fuseeCollisionVitesseY = 100 * positionDifferente.y / diff;
			
			generalLum.intensity = 2;
			energieSupprimer();
			i--;
		}else if (asteroide.angle > Math.PI) {
			
			obstaclesPool.unshift(this.asteroidesUtilisees.splice(i, 1)[0]);
			this.mesh.remove(asteroide.mesh);
			i--;
		}
	}
}

Particule = function() {
	var sphere = new THREE.TetrahedronGeometry( 3 , 0 );
	var materiaux = new THREE.MeshPhongMaterial({
		color:0xFD6417,
		shininess:0,
		specular:0xFD6417,
		shading:THREE.FlatShading
	});
	this.mesh = new THREE.Mesh( sphere , materiaux );
}

Particule.prototype.explose = function(position, couleur, echelle) {
	var This = this;
	var Parent = this.mesh.parent;
	
	this.mesh.material.color = new THREE.Color( couleur );
	this.mesh.material.needsUpdate = true;
	this.mesh.scale.set(echelle, echelle, echelle);
	
	var cibleX = position.x + (-1 + Math.random() * 2) * 50;
	var cibleY = position.y + (-1 + Math.random() * 2) * 50;
	var vitesse = .6 + Math.random() * .2;
	
	TweenMax.to(this.mesh.rotation, vitesse, {x : Math.random() * 12, y : Math.random() * 12});
	TweenMax.to(this.mesh.scale, vitesse, {x : .1, y : .1, z : .1});
	TweenMax.to(this.mesh.position, vitesse, {x : cibleX, y : cibleY, delay : Math.random() * .1, ease : Power2.easeOut, onComplete:function(){
		if(Parent) Parent.remove(This.mesh);
		This.mesh.scale.set( 1 , 1 , 1 );
		particulesPool.unshift(This);
	}});
}

ParticulesH = function () {
	this.mesh = new THREE.Object3D();
	this.particulesUtilisees = [];
}

ParticulesH.prototype.particulesApparition = function( position, densite, couleur, echelle ) {

	var nbreParticules = densite;
	
	for (var i = 0; i < nbreParticules; i++){
		var particule;
		if (particulesPool.length) {
			particule = particulesPool.pop();
		}else{
			particule = new Particule();
		}
		this.mesh.add(particule.mesh);
		particule.mesh.visible = true;
		var This = this;
		particule.mesh.position.y = position.y;
		particule.mesh.position.x = position.x;
		particule.explose(position, couleur , echelle);
	}
}

Carburant = function() {
	var triangle = new THREE.TetrahedronGeometry( 5 , 0 );
	var materiaux = new THREE.MeshPhongMaterial({
		color: 0xE4FA00,
		shininess: 0,
		specular: 0xFFFFFF,
		shading:THREE.FlatShading
	});
	
	this.mesh = new THREE.Mesh(triangle, materiaux);
	this.mesh.castShadow = true;
	this.angle = 0;
	this.dist = 0;
}

CarburantsH = function (nbrCarburants) {
	this.mesh = new THREE.Object3D();
	this.carburantsUtilises = [];
	this.carburantsPool = [];
	
	for (var i = 0; i < nbrCarburants; i++){
		var carburant = new Carburant();
		this.carburantsPool.push(carburant);
	}
}

CarburantsH.prototype.spawnbrCarburants = function() {

	var nbrCarburants = 1 + Math.floor(Math.random() * 10);
	var distance = jeu.terreRayon + jeu.fueseeTailleDefault + (-1 + Math.random() * 2) * (jeu.fuseeAmplitudeHauteur - 20);
	var amplitude = 10 + Math.round(Math.random() * 10);
	
	for (var i = 0; i < nbrCarburants; i++) {
		var carburant;
		if (this.carburantsPool.length) {
			carburant = this.carburantsPool.pop();
		}else {
			carburant = new Carburant();
		}
		this.mesh.add(carburant.mesh);
		this.carburantsUtilises.push(carburant);
		carburant.angle = - (i * 0.02);
		carburant.distance = distance + Math.cos(i * .5) * amplitude;
		carburant.mesh.position.y = -jeu.terreRayon + Math.sin(carburant.angle) * carburant.distance;
		carburant.mesh.position.x = Math.cos(carburant.angle) * carburant.distance;
	}
}

CarburantsH.prototype.carburantsRotation = function() {
	for (var i = 0; i < this.carburantsUtilises.length; i++) {
		var carburant = this.carburantsUtilises[i];
		
		if (carburant.exploding) continue;
		
		carburant.angle += jeu.vitesse*tempsDelta * 0.5;
		
		if (carburant.angle>Math.PI*2) carburant.angle -= Math.PI * 2;
		
		carburant.mesh.position.y = -jeu.terreRayon + Math.sin(carburant.angle) * carburant.distance;
		carburant.mesh.position.x = Math.cos(carburant.angle) * carburant.distance;
		carburant.mesh.rotation.z += Math.random() * .1;
		carburant.mesh.rotation.y += Math.random() * .1;

		var positionDifferente = fusee.mesh.position.clone().sub(carburant.mesh.position.clone());
		var distance = positionDifferente.length();
		
		if (distance < 15) {
			this.carburantsPool.unshift(this.carburantsUtilises.splice(i,1)[0]);
			this.mesh.remove(carburant.mesh);
			
			particulesH.particulesApparition(carburant.mesh.position.clone(), 5, 0xE4FA00, .8);
			energieAjouter();
			i--;
		}else if (carburant.angle > Math.PI) {
			this.carburantsPool.unshift(this.carburantsUtilises.splice(i,1)[0]);
			this.mesh.remove(carburant.mesh);
			i--;
		}
	}
}


//Model 3D 
var terre;
var fusee;

function creeFusee() {
	fusee = new FuseeEspace();
	fusee.mesh.scale.set( .24 , .24 , .24 );
	fusee.mesh.position.y = jeu.fueseeTailleDefault;
	paysage.add(fusee.mesh);
}

function creeTerre() {
	terre = new Terre();
	terre.mesh.position.y = -jeu.terreRayon;
	paysage.add(terre.mesh);
}

function creeEspace() {
	espace = new Espace();
	espace.mesh.position.y = -jeu.terreRayon;
	paysage.add(espace.mesh);
}

function creeCarburants() {
	carburantsH = new CarburantsH( 25 );
	paysage.add(carburantsH.mesh)
}

function creeObstacles() {
	for (var i = 0; i < 10; i++){
		var asteroide = new Asteroide();
		obstaclesPool.push(asteroide);
	}
	asteroideH = new AsteroideH();
	paysage.add(asteroideH.mesh)
}

function creeParticules() {
	for (var i = 0; i < 10; i++){
		var particle = new Particule();
		particulesPool.push(particle);
	}
	particulesH = new ParticulesH();
	paysage.add(particulesH.mesh)
}

function boucle() {

	tempsNouveau = new Date().getTime();
	tempsDelta = tempsNouveau-tempsAncien;
	tempsAncien = tempsNouveau;

	if (jeu.etat=="jouer") {

		if (Math.floor(jeu.distance) % 100 == 0 && Math.floor(jeu.distance) > jeu.carburantDerniereApparition) {
			jeu.carburantDerniereApparition = Math.floor(jeu.distance);
			carburantsH.spawnbrCarburants();
		}

		if (Math.floor(jeu.distance) % jeu.distanceVitesseMaj == 0 && Math.floor(jeu.distance) > jeu.vitesseDerniereMaj) {
			jeu.vitesseDerniereMaj = Math.floor(jeu.distance);
			jeu.cibleBaseVitesse += jeu.incremVitesseTemps*tempsDelta;
		}


		if (Math.floor(jeu.distance) % 50 == 0 && Math.floor(jeu.distance) > jeu.obstacleDerniereApparition) {
			jeu.obstacleDerniereApparition = Math.floor(jeu.distance);
			asteroideH.asteroideApparition();
    }

		if (Math.floor(jeu.distance) % jeu.distanceNiveauMaj == 0 && Math.floor(jeu.distance) > jeu.niveauDerniereMaj) {
			jeu.niveauDerniereMaj = Math.floor(jeu.distance);
			jeu.niveau++;
			niveauPlatforme.innerHTML = Math.floor(jeu.niveau);

			jeu.cibleBaseVitesse = jeu.vitesseInit + jeu.incremVitesseNiveau * jeu.niveau
		}


		fuseeMaj();
		distanceMaj();
		carburantMaj();
		
		jeu.vitesseDeBase += (jeu.cibleBaseVitesse - jeu.vitesseDeBase) * tempsDelta * 0.021;
		jeu.vitesse = jeu.vitesseDeBase * jeu.fuseeVitesseBase;

	}else if(jeu.etat == "jeuFini") {
		jeu.vitesse *= .98;
		
		fusee.mesh.rotation.z += (-Math.PI/2 - fusee.mesh.rotation.z) * .00021 * tempsDelta;
		fusee.mesh.rotation.x += 0.00031 * tempsDelta;
		
		jeu.fuseeVitesseDestruction *= 1.06;
		fusee.mesh.position.y -= jeu.fuseeVitesseDestruction * tempsDelta;

		if (fusee.mesh.position.y < -200) {
			afficherRejouer();
			jeu.etat = "attenteRejouer";
		}
	}else if (jeu.etat=="attenteRejouer") { }

	terre.mesh.rotation.z += jeu.vitesse*tempsDelta;

	if ( terre.mesh.rotation.z > 2 * Math.PI)  terre.mesh.rotation.z -= 2 * Math.PI;

	generalLum.intensity += (.5 - generalLum.intensity) * tempsDelta * 0.0051;

	carburantsH.carburantsRotation();
	asteroideH.asteroideRotation();

	espace.bougerNuages();
	terre.montagneDynamique();

	createur.render(paysage, camera);
	requestAnimationFrame( boucle );
}


function distanceMaj() {
	jeu.distance += jeu.vitesse * tempsDelta * jeu.retioVitDist;
	distanceChamp.innerHTML = Math.floor(jeu.distance);
	var dist = 502 * (1 - (jeu.distance % jeu.distanceNiveauMaj) / jeu.distanceNiveauMaj);
	cercleNiveau.setAttribute("stroke-dashoffset", dist);

}

var clignotementEnergie=false;

function carburantMaj() { 
	jeu.energie -= jeu.vitesse * tempsDelta * jeu.ratioVitNrj;
	jeu.energie = Math.max(0, jeu.energie);
	
	energieBarre.style.right = (100 - jeu.energie) + "%";
	energieBarre.style.backgroundColor = (jeu.energie < 50)? "#F20000" : "#091FE5";

	if (jeu.energie < 30) {
		energieBarre.style.animationName = "blinking";
	}else {
		energieBarre.style.animationName = "none";
	}

	if (jeu.energie < 1) {
		jeu.etat = "jeuFini";
	}
}

function energieAjouter() {
	jeu.energie += 3;
	jeu.energie = Math.min( jeu.energie , 100 );
}

function energieSupprimer() {
	jeu.energie -= 10;
	jeu.energie = Math.max( 0 , jeu.energie );
}

function fuseeMaj() {

	jeu.fuseeVitesseBase = normaliser( posSouris.x, -.5 , .5 , 1.2 , 1.6 );
	
	var cibleY = normaliser( posSouris.y , -.74 , .74 , jeu.fueseeTailleDefault -jeu.fuseeAmplitudeHauteur, jeu.fueseeTailleDefault + jeu.fuseeAmplitudeHauteur);
	var cibleX = normaliser( posSouris.x , -1 , 1 , -jeu.fuseeAmplitudeLargeur * .7, -jeu.fuseeAmplitudeLargeur );

	jeu.fuseeCollisionX += jeu.fuseeCollisionVitesseX;
	cibleX += jeu.fuseeCollisionX;


	jeu.fuseeCollisionY += jeu.fuseeCollisionVitesseY;
	cibleY += jeu.fuseeCollisionY;

	fusee.mesh.position.y += (cibleY - fusee.mesh.position.y) * tempsDelta * 0.005;
	fusee.mesh.position.x += (cibleX - fusee.mesh.position.x) * tempsDelta * 0.005;
	fusee.mesh.rotation.z = (cibleY - fusee.mesh.position.y) * tempsDelta * 0.0008;
	fusee.mesh.rotation.x = (fusee.mesh.position.y - cibleY) * tempsDelta * 0.0004;
	
	var cibleCameraZ = normaliser(jeu.fuseeVitesseBase, 1.2 , 1.6 , 150 , 500 );
	camera.fov = normaliser( posSouris.x , -1 , 1 , 39 , 79 );
	camera.updateProjectionMatrix ()
	camera.position.y += (fusee.mesh.position.y - camera.position.y) * tempsDelta * 0.002;

	jeu.fuseeCollisionVitesseX += (0 - jeu.fuseeCollisionVitesseX) * tempsDelta * 0.03;
	jeu.fuseeCollisionX += (0 - jeu.fuseeCollisionX) * tempsDelta * 0.01;
	jeu.fuseeCollisionVitesseY += (0 - jeu.fuseeCollisionVitesseY) * tempsDelta * 0.03;
	jeu.fuseeCollisionY += (0 - jeu.fuseeCollisionY) * tempsDelta * 0.01;

	fusee.astronaute.majCheveux();
}

function afficherRejouer() {
	messageRejouer.style.display = "block";
}

function cacherRejouer() {
	messageRejouer.style.display = "none";
}

function normaliser ( vit , vitMin , vitMax , taMin , taMax ) {
    var av = Math.max ( Math.min ( vit , vitMax ) , vitMin );
    var bv = vitMax - vitMin;
    var cv = ( av - vitMin ) / bv;
    var dt = taMax - taMin;
    var et = taMin + ( cv * dt );
    return et;
}

var distanceChamp , energieBarre , messageRejouer , niveauPlatforme , cercleNiveau;

function initialisation(evenement) {

	distanceChamp = document.getElementById("distanceValeur");
	energieBarre = document.getElementById("energieBarre");
	messageRejouer = document.getElementById("messageRejouer");
	niveauPlatforme = document.getElementById("valeurNiveau");
	cercleNiveau = document.getElementById("cercleNiveauStroke");

	resetJeu();
	creerPaysage();

	creeLumiere();
	creeFusee();
	creeTerre();
	creeEspace();
	creeCarburants();
	creeObstacles();
	creeParticules();

	document.addEventListener('mousemove', deplacementSouris, false);
	document.addEventListener('touchmove', deplacementClick, false);
	document.addEventListener('mouseup', deplacementSourisHaut, false);
	document.addEventListener('touchend', deplacementClickFin, false);

	boucle();
}

window.addEventListener('load', initialisation, false);

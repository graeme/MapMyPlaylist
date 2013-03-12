function artistMapping (form){
	for (Count = 0; Count < 2; Count++) {
        	if (form.display[Count].checked)
        	break;
    	}
	//if "map recently listened"
    	if (Count == 0){
		alert ("Map recently listened is selected");
		//TODO
		var username = "grammo106";	
		getData("playlist",username);    
	}
	//if "map top artists"
	if (Count == 1){
		alert ("Map top arists is selected");		
		//TODO
	}
}
//global variables
var map = "";			//map
var userMarker = {};		//marker for the user
var minLatLng = [];		//minimum latitude and longitude
var maxLatLng = [];		//maximum latitude and longitude
var mappingSuccessful = "";	//set to successful if number of markers added is greater than 0

//initialises the page
function init(){
	var map = createMap();
	//plots a marker of the user's location
        function onLocationFound(e){
        	var userIcon = L.icon({iconUrl:'static/img/pin_green.png',iconSize: [50,50],iconAnchor: [15,49]});
                var radius = e.accuracy / 2;
                userMarker = L.marker(e.latlng, {icon: userIcon}).addTo(map)    
                L.circle(e.latlng, radius).addTo(map);
        }
        function onLocationError(e) {alert(e.message)}
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        map.locate({setView: true, maxZoom: 7});                 
}


//creates the map
function createMap(){
	//adds the tilelayer toner from Stamen to the map	
	var toner = new L.TileLayer("http://tile.stamen.com/toner/{z}/{x}/{y}.png");
	map = new L.Map('map', { minZoom: 2, layers: [toner]});
   	var baseLayers = {"Toner": toner};
	L.control.layers(baseLayers).addTo(map);
	return map;
}

//gets the artist data where name is either bandname or playlistname 
function getData(find,name){
	if(find == "artist"){
		$.getJSON('/findartist/' + name + '/', function(data){
			console.log("reached artist getData");
			setMinMaxLatLng();                	
			plotArtists(data, map)
		})
	}
	if(find == "playlist"){
		$.getJSON('/finduserplaylist/' + name + '/', function(data){
			console.log("reached playlist getData");
			setMinMaxLatLng();			
                	plotArtists(data, map)
        	})
	}
}

//sets the minimum and maximum latitude and longitude 
//to the user's location 
function setMinMaxLatLng(){
	var userLat = userMarker.getLatLng().lat;
        var userLong = userMarker.getLatLng().lng;
        minLatLng = [userLat, userLong];
        maxLatLng = [userLat, userLong];
}

//plots the artist on the map
function plotArtists(artists, map){
    mappingSuccessful = false;
    $.each(artists, function(){ 
        var latitude = parseFloat(this.lat);
	var longitude = parseFloat(this.long);
        if(isNaN(latitude)){
	    enterLocation(this);
	    return true;
        }
	else{
	    if(latitude < minLatLng[0]) { minLatLng[0] = latitude };
	    if(latitude > maxLatLng[0]) { maxLatLng[0] = latitude };
	    if(longitude < minLatLng[1]) { minLatLng[1] = longitude };
	    if(longitude > maxLatLng[1]) { maxLatLng[1] = longitude };
            artist={lat:latitude,long:longitude,label:this.name,image:this.img_url,summary:this.bio};
            setMarker(artist, map);
	}
    })
    //if at least one marker has been added, adjust the bounds of the map
    if(mappingSuccessful){
	map.fitBounds([minLatLng,maxLatLng]); 
    }   	
};

//sets a marker for a location of an artist
function setMarker(artist, map){
    //#FFAE4A
    //#3FD98B
    //#EF4581
    var location = new L.LatLng(artist.lat, artist.long);
    var marker = new L.CircleMarker(location, {color: 'black', opacity: '1', fillColor:'#FFAE4A', fillOpacity:'0.8'}).bindPopup(
            '<img id="artist-popup-image" src="' + 
            artist.image + 
            '" align="right">' + 
            '<div id="artist-popup-title">' +
            artist.label + 
            '</div>' +
            '<div id="artist-popup-bio">' +
            artist.summary +
            '</div>'
            );
    map.addLayer(marker);
    mappingSuccessful = true;
};
//    var marker = L.marker(location, {title: artist.label, icon: musicIcon}).bindPopup("<table><tr><td><img src=" + artist.image + " height=100% width=100%></td><td>" + artist.summary + "</td></tr></table>");


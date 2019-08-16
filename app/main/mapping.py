from app.main import bp
from flask import render_template, request, current_app

from bokeh.plotting import figure, show, output_file, gmap
from bokeh.tile_providers import get_provider, Vendors
from bokeh.sampledata.sample_geojson import geojson
from bokeh.embed import components
from bokeh.models import ColumnDataSource

from pyproj import Proj, transform

from bson.objectid import ObjectId

import math, requests, sys, json, yaml

# Global variables
div = "<h2>MAP NOT GENERATED YET</h2><br><h4>Please search if you haven't yet. Map needs search results to plot. If you have, keep reloading the page until the map loads</h4>"
script = ""

# Creates map using the given source, formatted as a ColumnDataSource
def create_map(source, tooltips):

    # Free GMap Key if desired, not useful rn because of limitations of free keys
    gmapKey = '***REMOVED***'

    # Create map
    p = figure(x_range=(-2000000, 6000000), y_range=(-1000000, 7000000),
            x_axis_type="mercator", y_axis_type="mercator", tooltips=tooltips)
    p.add_tile(get_provider(Vendors.CARTODBPOSITRON))  
    p.circle(x='x', y='y', size=15, color='Color', alpha=0.4, source=source)

    return p


# Converts lat and lng to webmercador coordinates
def LongLat_to_EN(long, lat):
    try:
      easting, northing = transform(
        Proj(init='epsg:4326'), Proj(init='epsg:3857'), long, lat)
      return easting, northing
    except:
      return None, None


# Get location names from ids, and lat&lng from geocoding
def getSourceFromId(idList):

    # Declare arrays to be filled
    lats = [] # Stores latitudess of regions
    lngs = [] # Stores longitudes of regions
    info = [] # Info on mapped objects
    colors = [] # Colors each object is to be mapped with
    x_coords = [] # Lat&Lng converted to Easting
    y_coords = [] # Lat&Lng converted to Northing

    # Extract from API the location names for ids
    for id in idList:

        # Get the object with the specified id from database
        playbill = current_app.data.driver.db['ephemeralRecord']
        obj = playbill.find_one({"_id": ObjectId(id)})

        # Parse the region, hardcoded for now
        try: 
            med = obj['medievalChronicles']
            med = med['chronicles']
            geo = med['geography']
            geo = geo[0]
            region = geo['region']

             # Geocode into lat & lng from datasciencetoolkit API
            response = requests.get('http://www.datasciencetoolkit.org/maps/api/geocode/json?sensor=false&address=' + region)
            content = json.loads(response.content)
            results = content['results']
            results = results[0]
            geometry = results['geometry']
            loc = geometry['location']
            lats.append(loc['lat'])
            lngs.append(loc['lng'])

            # Fill ids and colors
            info.append(id)
            colors.append('#FF0000')

        except:
            # If obj has no region, skip it
            # Possibly logic here to print skipped objects
            continue
    
    # Convert from lat and lng to mercador coordinates
    for i in range(len(lats)):
        east, north = LongLat_to_EN(lngs[i], lats[i])
        x_coords.append(east)
        y_coords.append(north)

    # Construct column data source
    source = ColumnDataSource(data=dict(
                        x=x_coords, 
                        y=y_coords,
                        Color=colors,
                        info=info))

    return source


# Get location names from projected data, and lat&lng from geocoding
def getSourceFromProjected(objList):

    # Declare arrays to be filled
    lats = [] # Stores latitudess of regions
    lngs = [] # Stores longitudes of regions
    info = [] # Ids of mapped objects
    colors = [] # Colors each object is to be mapped with
    x_coords = [] # Lat&Lng converted to Easting
    y_coords = [] # Lat&Lng converted to Northing

    # Extract from API the location names for ids
    for curr in objList:

        # Get the object with the specified id from database
        playbill = current_app.data.driver.db['ephemeralRecord']
        obj = playbill.find_one({"_id": ObjectId(curr['_id'])})

        # Parse the region, hardcoded for now
        try: 
            med = obj['medievalChronicles']
            med = med['chronicles']
            geo = med['geography']
            geo = geo[0]
            region = geo['region']

            # Geocode into lat & lng from datasciencetoolkit API
            response = requests.get('http://www.datasciencetoolkit.org/maps/api/geocode/json?sensor=false&address=' + region)
            content = json.loads(response.content)
            results = content['results']
            results = results[0]
            geometry = results['geometry']
            loc = geometry['location']
            lats.append(loc['lat'])
            lngs.append(loc['lng'])

            # Cut tooltip text if too long
            textYaml = yaml.dump(yaml.load(json.dumps(curr)))
            textYaml = textYaml[0 : min(len(textYaml), textYaml.find('\n', 800))]

            # Fill ids and colors
            tooltip = "<pre>{}</pre>".format(textYaml)
            info.append(tooltip)
            colors.append('#FF0000')

        except:
            # If obj has no region, skip it
            # Possibly logic here to print skipped objects
            continue
    
    # Convert from lat and lng to mercador coordinates
    for i in range(len(lats)):
        east, north = LongLat_to_EN(lngs[i], lats[i])
        x_coords.append(east)
        y_coords.append(north)

    # Construct column data source
    source = ColumnDataSource(data=dict(
                        x=x_coords, 
                        y=y_coords,
                        Color=colors,
                        info=info))

    return source


# Create map only with ids
@bp.route('/createmap', methods=['POST'])
def create_mapping():

    # Construct the source for only the given list of ids
    idList = request.get_json()
    idList = idList['ids']
    source = getSourceFromId(idList)

    # Hover information
    tooltips = [
        ('ID', '@info{safe}')
    ]

    # Plot using the source
    plot = create_map(source, tooltips)

    # # Create script and div for web
    script_temp, div_temp = components(plot)
    global script 
    script = script_temp
    global div 
    div = div_temp

    # Render template with map
    return render_template('mapping.html', script=script, div=div)
    # return render_template('mapping.html')


# Create map with projected data
@bp.route('/createprojectedmap', methods=['POST'])
def create_projected_mapping():

    # Construct the source for only the given list of ids
    objList = request.get_json()
    objList = objList['objs']
    source = getSourceFromProjected(objList)

    # Hover information
    tooltips = [
        ('Chronicle', '@info{safe}')
    ]

    # Plot using the source
    plot = create_map(source, tooltips)

    # # Create script and div for web
    script_temp, div_temp = components(plot)
    global script 
    script = script_temp
    global div 
    div = div_temp

    # Render template with map
    return render_template('mapping.html', script=script, div=div)


# Route /mapping so that it only displays the map
@bp.route('/mapping', methods=['GET'])
def render_map():
    return render_template('mapping.html', script=script, div=div)



from flask import Blueprint, request, jsonify
from stegano import lsb
import base64
import json
from PIL import Image
import io

operations = Blueprint('operations', __name__)


def decode_base64_image(base64_string):
    """Decodează un string Base64 într-o imagine."""
    img_data = base64.b64decode(base64_string)
    img = Image.open(io.BytesIO(img_data))
    return img


def encode_image_to_base64(image):
    """Encodează o imagine într-un string Base64."""
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')



"""
    functie care incarca in memorie imaginile din baza de date

    input: 
        JSON
        [
            {
                imageBase64
            }
        ]
    output: nimic
"""
@operations.route('/api/python/loadData/', methods=['POST'])
def loadData():
    data = request.json

    # se primeste un vector de imagini
    return jsonify({'imageBase64': data})




"""
    functie care adauga intr-o imagine metadatele

    input: 
        JSON
        {
            imageBase64,
            data:
            [
                {
                    type,
                    points:
                    [
                        {
                            x,
                            y
                        }
                    ]
                }
            ]
        }
    output:
        JSON
        {
            imageBase64
        }

        
        id : int-id
        [{(int-x,int-y), str-tip, str-continut}]
"""
@operations.route('/api/python/addData/', methods=['POST'])
def addData():
    data = request.json

    # Decodează imaginea din Base64
    image_base64 = data.get('imageBase64')
    image = decode_base64_image(image_base64)

    # Extrage datele din request
    metadata = data.get('data', [])

    # Convertim metadatele într-un string JSON și apoi într-un format Base64
    metadata_json = json.dumps(metadata)
    metadata_base64 = base64.b64encode(metadata_json.encode('utf-8')).decode('utf-8')

    # Ascundem metadatele în imagine folosind LSB (Least Significant Bit) steganography
    secret_image = lsb.hide(image, metadata_base64)

    # Re-encodează imaginea modificată într-un string Base64
    new_image_base64 = encode_image_to_base64(secret_image)

    return jsonify({'imageBase64': new_image_base64})


"""
    functie care suprascrie metadatele dintr-o imagine

    input: 
        JSON
        {
            imageBase64,
            data:
            [
                {
                    type,
                    points:
                    [
                        {
                            x,
                            y
                        }
                    ]
                }
            ]
        }
    output:
        JSON
        {
            imageBase64
        }

"""
@operations.route('/api/python/modifyData/', methods=['POST'])
def modifyData():
    data = request.json

    # Decodificăm imaginea din Base64
    image_base64 = data.get('imageBase64')
    image = decode_base64_image(image_base64)

    # Creăm un JSON cu noile metadate pentru a fi ascunse
    new_metadata_json = json.dumps(data['data']).encode('utf-8')
    new_metadata_base64 = base64.b64encode(new_metadata_json).decode('utf-8')

    # Ascundem noile date în imagine
    modified_image = lsb.hide(image, new_metadata_base64)

    # Convertim imaginea modificată înapoi în Base64
    modified_image_base64 = encode_image_to_base64(modified_image)

    # Returnăm imaginea modificată
    return jsonify({'imageBase64': modified_image_base64})



"""
    functie care extrage metadatele dintr-o imagine

    input: 
        JSON
        {
            imageBase64
        }
    output:
        JSON
        {
            data:
            [
                {
                    type,
                    points:
                    [
                        {
                            x,
                            y
                        }
                    ]
                }
            ]
        }

"""
@operations.route('/api/python/extractData/', methods=['POST'])
def extractData():
    data = request.json

    # Decodează imaginea din Base64
    image_base64 = data.get('imageBase64')
    image = decode_base64_image(image_base64)

    # Extragem metadatele ascunse din imagine folosind LSB
    hidden_data = lsb.reveal(image)

    # Decodificăm datele din Base64 înapoi în JSON
    if hidden_data:
        metadata_json = base64.b64decode(hidden_data).decode('utf-8')
        metadata = json.loads(metadata_json)
        return jsonify({'data': metadata})
    else:
        return jsonify({'error': 'No hidden data found in the image.'}), 400


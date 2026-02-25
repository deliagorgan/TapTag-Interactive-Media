from flask import Flask, request, jsonify
from imageOperations import operations
#from synonymGenerator import generateSynonyms

app = Flask(__name__)

serverPort = 44444

app.register_blueprint(operations)

if __name__ == '__main__':
    app.run(port=serverPort)

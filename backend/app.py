from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/test', methods=['GET'])
def index():
    return jsonify({"data": "Test API"})

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
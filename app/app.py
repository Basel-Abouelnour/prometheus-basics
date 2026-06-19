from flask import Flask, Response
from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST

# simple flask app with prometheus monitoring
app = Flask(__name__)
requests_total = Counter(
    'app_requests_total',
    'Total requests'
)
@app.route('/')
def home():
    requests_total.inc()
    return "Hello ITI to python app with prometheus monitoring"
@app.route('/metrics')
def metrics():
    return Response(
        generate_latest(),
        mimetype=CONTENT_TYPE_LATEST
    )
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
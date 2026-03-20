import os
from dotenv import load_dotenv

load_dotenv()
key = os.getenv('OPENROUTER_API_KEY')
print('Key:', key)
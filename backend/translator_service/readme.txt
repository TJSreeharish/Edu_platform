docker build -t translator_service .
# You can change the port where to run 
docker run -it --gpus all -p 8005:8005 translator_service


This is my Flow 
In frontend you type the text in the box ( edit transcript ) and click on translate 

Frontend sends transcript + target language and goes to Django /translate/nllb/

Django wil send to FastAPI /translate

FastAPI runs mine NLLB translation and returns translated text

Django passes response to Frontend updates editor with translated text


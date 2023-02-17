FROM python:3.11
WORKDIR /app
COPY ["requirements.txt","main.py","./"]
RUN pip install -r requirements.txt
RUN playwright install && playwright install-deps
CMD ["bash"]
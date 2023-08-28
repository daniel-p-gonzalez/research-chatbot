import json
import sagemaker
import boto3
from sagemaker.huggingface import HuggingFaceModel, get_huggingface_llm_image_uri

role = "arn:aws:iam::083668992234:role/service-role/SageMaker-deploy"
# try:
# 	role = sagemaker.get_execution_role()
# except ValueError:
# 	iam = boto3.client('iam')
# 	role = iam.get_role(RoleName='sagemaker_execution_role')['Role']['Arn']

# Hub Model configuration. https://huggingface.co/models
hub = {
    #'HF_MODEL_ID':'lmsys/vicuna-13b-v1.5-16k',
    "HF_MODEL_ID": "luffycodes/nash-vicuna-13b-v1dot5-ep2-w-rag-w-simple",
    "SM_NUM_GPUS": json.dumps(1),
}


# create Hugging Face Model Class
huggingface_model = HuggingFaceModel(
    image_uri=get_huggingface_llm_image_uri("huggingface", version="0.9.3"),
    env=hub,
    role=role,
)

# deploy model to SageMaker Inference
predictor = huggingface_model.deploy(
    initial_instance_count=1,
    memory_size_in_mb=4096,
    instance_type="ml.g5.8xlarge",
    container_startup_health_check_timeout=3600,
)


# send request
predictor.predict(
    {
        "inputs": "My name is Julien and I like to",
    }
)

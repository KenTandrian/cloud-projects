# compile_pipeline.py
from kfp import dsl
from kfp.compiler import Compiler

# Define a simple component
@dsl.component
def hello_world(text: str) -> str:
    print(text)
    return text

# Define the pipeline
@dsl.pipeline(
    name='hello-world-pipeline',
    description='A simple introductory pipeline'
)
def pipeline_hello_world(text: str = 'Hello, World!'):
    hello_world_task = hello_world(text=text)

# Compile the pipeline into a JSON file
if __name__ == '__main__':
    Compiler().compile(
        pipeline_func=pipeline_hello_world,
        package_path='pipeline.json' # The output file
    )
    print("Pipeline compiled successfully to pipeline.json")

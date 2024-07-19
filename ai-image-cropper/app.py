"""
Content-Aware Image Cropper App

This app uses Vertex AI Gemini to detect objects in an image and crop the image
to focus on those objects.
"""

import base64
import io
import vertexai
from flask import Flask, render_template, request
from PIL import Image, ImageDraw
from vertexai.generative_models import GenerativeModel, Part
from vertexai.preview.generative_models import HarmBlockThreshold, HarmCategory

vertexai.init(project="vertex-ai-demo-415614", location="asia-southeast1")
model = GenerativeModel(
    "gemini-1.5-pro-001",
    system_instruction=[
        """
        You are an expert in detecting objects in a picture.
        The user will give you an image and a list of objects.
        Your job is to give a bounding box that covers the objects.
        If the user mentions two objects, give the bounding box for both.
        Return the result in comma-separated integers without any explanation.
        Different bounding boxes should be separated by semicolons.
        Example: 12,34,56,78;90,12,34,56
        """
    ],
)

generation_config = {
    "max_output_tokens": 8192,
    "temperature": 0,
    "top_p": 0.95,
}

safety_settings = {
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
}


def get_object_bbox_from_gemini(image_data, focus_object):
    """
    This function is used to interact with Vertex AI Gemini.
    Gemini will return bounding boxes in the format:
    [top, left, bottom, right]
    """
    image1 = Part.from_data(mime_type="image/jpeg", data=base64.b64decode(image_data))
    text1 = Part.from_text(
        f"I want a bounding box that covers {focus_object} in this picture. "
        "Give me the bounding boxes."
    )

    responses = model.generate_content(
        [image1, text1],
        generation_config=generation_config,
        safety_settings=safety_settings,
        stream=False,
    )
    result = responses.text
    print('Object bbox:', result)

    # Parse Gemini's output into a 2-dimensional list of integers
    object_bbox = [
        [int(x) for x in bbox.split(",")]
        for bbox in result.replace("\n", "").split(";")
    ]

    # Correct the order of coordinates for PIL
    object_bbox = [[bbox[1], bbox[0], bbox[3], bbox[2]] for bbox in object_bbox]

    # Convert to tuples
    object_bbox = [tuple(bbox) for bbox in object_bbox]

    return object_bbox


# pylint: disable=too-many-locals
def crop_image(image_data, object_bbox):
    """
    This function crops the image into square by taking the center of all bounding boxes.
    """
    # Use PIL to crop the image
    im = Image.open(io.BytesIO(base64.b64decode(image_data)))
    width, height = im.size

    # Calculate the center of all bounding boxes
    center_x = 0
    center_y = 0
    for bbox in object_bbox:
        center_x += (bbox[0] + bbox[2]) / 2
        center_y += (bbox[1] + bbox[3]) / 2
    center_x /= len(object_bbox)
    center_y /= len(object_bbox)

    # Translate the center coordinate from 1000x1000 to actual image size
    center_x = int(center_x * width / 1000)
    center_y = int(center_y * height / 1000)

    # Calculate the center of the original image
    center_x_orig = width / 2
    center_y_orig = height / 2

    # Determine the side length
    side_length = min(width, height)

    # Calculate the top-left corner of the square crop
    if center_x > center_x_orig:
        bottom_right_x = min(width, int(center_x + side_length / 2))
        top_left_x = bottom_right_x - side_length
    else:
        top_left_x = max(0, int(center_x - side_length / 2))
        bottom_right_x = top_left_x + side_length

    if center_y > center_y_orig:
        bottom_right_y = min(height, int(center_y + side_length / 2))
        top_left_y = bottom_right_y - side_length
    else:
        top_left_y = max(0, int(center_y - side_length / 2))
        bottom_right_y = top_left_y + side_length

    # Crop the image with square aspect ratio
    cropped_image = im.crop((top_left_x, top_left_y, bottom_right_x, bottom_right_y))

    # Convert cropped image to base64
    buffered = io.BytesIO()
    cropped_image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str


def annotate_image(image_data, object_bbox):
    """
    This function annotates the image with bounding boxes.
    """
    # Use PIL to crop the image
    im = Image.open(io.BytesIO(base64.b64decode(image_data)))
    width, height = im.size

    colors = [
        "red",
        "green",
        "blue",
        "yellow",
        "magenta",
        "cyan",
        "purple",
        "pink",
        "orange",
        "brown",
        "gray",
    ]

    # Annotate for each bounding box
    for i, bbox in enumerate(object_bbox):
        # Translate coordinates from 1000x1000 to actual image size
        bbox = (
            int(bbox[0] * width / 1000),
            int(bbox[1] * height / 1000),
            int(bbox[2] * width / 1000),
            int(bbox[3] * height / 1000),
        )

        draw = ImageDraw.Draw(im)
        draw.rectangle(bbox, outline=colors[i % len(colors)], width=5)
    # Convert cropped image to base64
    buffered = io.BytesIO()
    im.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str


app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def index():
    """
    This function handles the main route of the web application.
    """
    if request.method == "POST":
        uploaded_file = request.files["image"]
        if uploaded_file.filename != "":
            # Convert uploaded file to base64
            image_data = base64.b64encode(uploaded_file.read()).decode("utf-8")
            focus_object = request.form.get("focus_object")

            # Get object bounding box from Gemini
            object_bbox = get_object_bbox_from_gemini(image_data, focus_object)

            # Crop and annotate the image 
            cropped_image_data = crop_image(image_data, object_bbox)
            annotated_image_data = annotate_image(image_data, object_bbox)
            return render_template(
                "index.html",
                cropped_image=cropped_image_data,
                annotated_image=annotated_image_data,
            )
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)

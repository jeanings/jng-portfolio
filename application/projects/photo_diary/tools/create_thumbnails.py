#-------------------------------------------------------
# Script for creating thumbnails of images collection.
#-------------------------------------------------------
from os import environ
from pathlib import Path
from PIL import Image

PROJ_FOLDER = Path.cwd() / 'application' / 'projects' / 'photo_diary'
IMG_FOLDER =  PROJ_FOLDER / 'images'


def batch_create_thumbnails():
    image_extensions = ['.jpg', '.jpeg', '.png', '.tiff']
    thumbnail_max_size = (300, 300)

    # 2022, 2021, 2020 etc.
    for year_folder in IMG_FOLDER.iterdir():
        # 'America.Vancouver', 'Japan'
        print(">>> Opened {0}".format(year_folder))
        for image_set in year_folder.iterdir():
            thumbs_path = Path(image_set) / 'thumbs'
            thumbs_path.mkdir(parents=True, exist_ok=True)
            print(">>> Processing {0}".format(image_set))
            # Actual folder where main images are.
            for item in image_set.iterdir():
                # Create thumbnails for each image.
                if item.suffix in image_extensions:
                    pil_image = Image.open(item)
                    pil_image.thumbnail(thumbnail_max_size)
                    pil_image.save(str(thumbs_path / item.name))
    
    print(">>> All images thumbnail'ed.")


if __name__ == '__main__':
    batch_create_thumbnails()

#-----------------------------------
#   Tool for batch resizing images.
#-----------------------------------

from skimage import data, io
from skimage.transform import rescale
from pathlib import Path
import piexif

ROOT = Path('D:\\photo\\2017 Tokaido\\')
INPUT = ROOT / 'project'
OUTPUT = ROOT / 'resized'


def resize(filename):
    """ Takes in filename of image and resizes it. """
    base_image = INPUT / filename
    new_image = OUTPUT / base_image.name
    print(">>> Resizing: " + base_image.name + "...")
    image = io.imread(base_image, as_gray=False)

    # Rescaling.
    image_resized = rescale(image, 0.4, anti_aliasing=True, multichannel=True) * 255
    
    # Saving image.
    io.imsave(new_image, image_resized.astype('uint8'))
    print(">>> " + new_image.name + " resized.")

    # Add missing exif data into resized image.
    exif_dict = piexif.load(str(base_image))
    exif_bytes = piexif.dump(exif_dict)
    piexif.insert(exif_bytes, str(new_image))
    print(">>> " + new_image.name + " time-exif data added.")


def main():
    """ Crawl through images directory and resize images. """
    allowed_extensions = ['.jpg', '.JPG']
    image_list = [item for item in INPUT.rglob('**/*') if item.suffix in allowed_extensions]

    for file in image_list:
        resize(file)
            
    print("\n>>> Images resized. Closing program.\n")


if __name__ == '__main__':
    main()
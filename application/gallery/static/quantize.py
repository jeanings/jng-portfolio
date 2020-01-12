#--------------------------------------------------------------------------------------    
#   Tool for analyzing and returning images' most dominant colour based on RGB values.
#--------------------------------------------------------------------------------------

from skimage import data, io
from skimage.color import rgb2hsv
from skimage.transform import rescale
from sklearn.cluster import KMeans
from pathlib import Path
import numpy as np
import matplotlib, pprint

IMG_FOLDER = Path('images/')
STATIC = Path('static/')
OUTPUT = IMG_FOLDER / 'quantized'


def hsv_to_hsl(hsv_data):
    """ Convert HSV  values to HSL for use in HTML. """
    h_hsv, s_hsv, v_hsv = hsv_data[0], hsv_data[1] / 100, hsv_data[2] / 100

    # HSV to HSL conversion formulae -> https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_HSL
    h_hsl = h_hsv
    lum_hsl = v_hsv - (v_hsv * s_hsv)/2
    if lum_hsl == 0 or lum_hsl == 1:
        s_hsl = 0
    else:
        s_hsl = (v_hsv - lum_hsl) / min(lum_hsl, (1 - lum_hsl))
    
    hsl_data = []
    hsl_data.append([h_hsl, s_hsl * 100, lum_hsl * 100])
    hsl_data = np.around(hsl_data, decimals=0)

    return hsl_data
    

def find_color(filename):
    """ Calculates the dominant colour for pass-in image. """
    image_path = IMG_FOLDER / filename
    print("Analysing: " + filename)
    image = io.imread(image_path, as_gray=False)

    # Rescale for faster analysis.
    image_resized = rescale(image, 0.33, anti_aliasing=True, multichannel=True) * 255
    rows, cols, bands = image_resized.shape
    image_array = image_resized.reshape(rows*cols, bands)
    
    """
    # Enable for testing:
    io.imshow(image_resized.astype('uint8'))
    io.show()
    """

    # Fitting kmeans clustering
    #   n_colors        -> number of colours you need the image to be separated into. 
    #   random_state    -> setting a number allows for exact same results, for referencing.
    n_colors = 10
    kmeans_model = KMeans(n_clusters=n_colors, random_state=5).fit(image_array)
    labels = kmeans_model.labels_
    centers = kmeans_model.cluster_centers_

    # Reshape array into original's, to have it show properly.
    image_quantized = centers[labels].reshape(image_resized.shape).astype('uint8')
    
    """
    # Output and save to file if needed.
    io.imshow(image_quantized)
    io.show()
    io.imsave(IMG_FOLDER / 'quantized' / filename, image_quantized)
    """

    # Convert to HSV values to rank in order of hue.
    image_hsv = rgb2hsv(image_quantized)
    hsv_dict = {}
    colors, counts = np.unique(image_hsv.reshape(image_array.shape), return_counts=True, axis=0)
    for color, count in zip(colors, counts):
        color[0], color[1:] = np.round(color[0]*360, decimals=2), np.round(color[1:]*100, decimals=2)  
        hsv_dict[count] = color.tolist()
    
    hsv_sorted = sorted(hsv_dict.items(), key=lambda x: x[0], reverse=True)
    main_hsv_color = []
    main_hsv_color.append([filename, hsv_sorted[0][1]])
    
    return main_hsv_color


def main():
    """ Crawl through images directory and quantize images to get dominant color value. """
    hsv = []
    quantized_file = STATIC / 'hsv_list.npy'

    # Crawls through directory, calls find_color for each image found.
    if not quantized_file.is_file():
        exclude_dirs = set(['quantized'])
        
        for root, dirs, files in os.walk(IMG_FOLDER, topdown=True):
            [dirs.remove(dir) for dir in list(dirs) if dir in exclude_dirs]
            for file in files:
                main_hsv_color = find_color(file)
                hsv.append([main_hsv_color[0][0], main_hsv_color[0][1]])
                print(main_hsv_color[0][0], "done.")
        
        np.save(quantized_file, hsv)
    
    # Convert to HSL for export to HTML.
    hsl_list = []
    hsv_list = np.load(quantized_file, allow_pickle=True)
    for entry in hsv_list:
        hsl_conversion = hsv_to_hsl(entry[1])
        hsl = np.array(hsl_conversion).ravel()
        hsl_list.append([entry[0], hsl])
    
    # Sort by hue, luminance, saturation.
    hsl_sorted = sorted(hsl_list, key=lambda x: (x[1][0], x[1][2], x[1][1]))

    hsl_file = STATIC / 'hsl_list.npy'
    if not hsl_file.is_file():
        np.save(hsl_file, hsl_sorted)
    
    print("\nImages quantized and HSL-sorted. Closing program.\n")


if __name__ == '__main__':
    main()
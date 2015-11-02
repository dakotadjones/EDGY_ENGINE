import json
import sys

with open('../assets/' + sys.argv[1]) as data_file:
	data = json.load(data_file)

fresh = dict()
total_width = data['meta']['size']['w']
total_height = data['meta']['size']['h']

for key in data['frames']:
	key_array = key.split('_')
	pattern = key_array[0]
	surface_perspective = key_array[1] + "_" + key_array[2][:-4]
	if pattern not in fresh:
		fresh[pattern] = dict()
	if surface_perspective not in fresh[pattern]:
		fresh[pattern][surface_perspective] = dict()	
	fresh[pattern][surface_perspective]['h'] = data['frames'][key]['sourceSize']['h']/total_height
	fresh[pattern][surface_perspective]['w'] = data['frames'][key]['sourceSize']['w']/total_width
	fresh[pattern][surface_perspective]['y'] = data['frames'][key]['frame']['y']/total_height
	fresh[pattern][surface_perspective]['x'] = data['frames'][key]['frame']['x']/total_width

data_file.close()
output = open('../assets/texture_locations.ts', 'w')
output.truncate()
output.write('var packJSON = ')
json.dump(fresh, output, sort_keys=True)
output.write(';')
output.close()
from sklearn.cluster import OPTICS
from sklearn.preprocessing import LabelEncoder
import pandas as pd
import numpy as np
import json
import sys
from pandas.io.json import json_normalize

#Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    # Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

def main():
    #lines = read_in()
    #print(''.join(lines))
    '''
    json_dict = pd.read_json ('test_data.json')
    json_normalize(json_dict)'''
    with open('test_data.json', 'r', encoding='utf-8') as data_file:    
        data = json.load(data_file)
    clusterDfs = []
    for i in range(len(data)):
        df1 = json_normalize(data[i][0])
        df2 = json_normalize(data[i][1])
        clusterDf = pd.concat([df1, df2], sort=True)
        clusterDfs.append(clusterDf.drop(columns=['background_image', 'clip' \
            ]))
    print(clusterDfs[0].info())
# Start process
if __name__ == '__main__':
    main()


'''
dataset = []
encoder = LabelEncoder()
dataset = encoder.fit_transform(dataset.astype(str))
eps - predefined min threshold distance
delta/min_sample - minimum number of other instances
optics = OPTICS(min_samples=8)
X = np.array(dataset)
optics.fit(X)
vehicular["marca"] = pd.Series(optics.labels_)
labels = optics.labels_
n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)
print("number of clusters: " + str(n_clusters_))
outliers = (vehicular["marca"]==-1).sum()
print("outliers: " + str(outliers))
'''
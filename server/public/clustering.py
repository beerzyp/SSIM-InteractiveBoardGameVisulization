from sklearn.cluster import OPTICS
from sklearn.preprocessing import LabelEncoder
import pandas as pd
import numpy as np
import json
import sys


#Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    # Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

def main():
    lines = read_in()
    print(''.join(lines))

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
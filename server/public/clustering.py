from sklearn.cluster import SpectralClustering
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import euclidean_distances
import pandas as pd 
import matplotlib.pyplot as plt 
from sklearn.preprocessing import StandardScaler, normalize 
from sklearn.decomposition import PCA 
from sklearn.metrics import silhouette_score 
import numpy as np
import json
import sys
from pandas.io.json import json_normalize
import datetime
import time
import networkx as nx

# Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    # Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])
# Handles rating object returning each type of rating if existent or 0 else
def getRatings(ratings):
    all_ratings = pd.DataFrame(columns=['exceptional','meh','recommended','skip'])
    for i in range(len(ratings)):
        game_ratings = json_normalize(ratings[i])
        if not game_ratings.empty:
            game_rating =  game_ratings.groupby('title')['count'].max()
            game_transposed = pd.DataFrame(game_rating).transpose().reset_index(drop=True)
            all_ratings = all_ratings.append(game_transposed)
        else:
            all_ratings = all_ratings.append(pd.Series(), ignore_index=True)
    return all_ratings.reset_index(drop=True).fillna(0)

def getPlatforms(platforms):
    final_platforms = pd.DataFrame()
    for i in range(len(platforms)):
        game_platforms = json_normalize(platforms[i])
        if not game_platforms.empty:
            game_platform =  game_platforms['platform.id']
            platform_transposed = pd.DataFrame(game_platform).transpose().reset_index(drop=True)
            final_platforms = final_platforms.append(platform_transposed)
        else:
            final_platforms = final_platforms.append(pd.Series(), ignore_index=True)
    return final_platforms.fillna(0).astype('int64')

def getGenres(genres):
    defined_genres = ['action','indie','adventure','role-playing-games-rpg', \
        'shooter', 'strategy', 'casual', 'simulation', 'arcade', 'puzzle', 'platformer', \
        'racing', 'sports', 'massively-multiplayer', 'family', 'fighting', 'board-games', \
        'educational', 'card']
    all_genres = pd.DataFrame(columns=defined_genres)
    for i in range(len(genres)):
        genre = json_normalize(genres[i])
        if not genre.empty:
            this_genre = genre.groupby('name')['slug'].count()
            genre_transposed = pd.DataFrame(this_genre).transpose().reset_index(drop=True)
            all_genres = all_genres.append(genre_transposed)
        else:
            all_genres = all_genres.append(pd.Series(), ignore_index=True)
    final_genres = all_genres.fillna(0).reset_index(drop=True).astype('int64')
    return final_genres

def fillNanValues(clusterDf):
    # Filling nan values
    if 'metacritic' in clusterDf:
        clusterDf['metacritic'] = clusterDf['metacritic'].fillna(-1)
    else:
        clusterDf['metacritic'] = -1
    if 'community_rating' in clusterDf:
        clusterDf['community_rating'] = clusterDf['community_rating'].fillna(-1)
    else:
        clusterDf['community_rating'] = -1
    if 'suggestions_count' in clusterDf:
        clusterDf['suggestions_count'] = clusterDf['suggestions_count'].fillna(0)
    else:
        clusterDf['suggestions_count'] = 0
    if 'reviews_text_count' in clusterDf:
        clusterDf['reviews_text_count'] = clusterDf['reviews_text_count'].fillna(0)
    else:
        clusterDf['reviews_text_count'] = 0
    clusterDf['released'] = clusterDf['released'].fillna("2000-01-01")
    if 'ratings_count' in clusterDf:
        clusterDf['ratings_count'] = clusterDf['ratings_count'].fillna(0)
    else:
        clusterDf['ratings_count'] = 0
    if 'added_by_status.beaten' in clusterDf:
        clusterDf['added_by_status.beaten'] = clusterDf['added_by_status.beaten'].fillna(0)
    else:
        clusterDf['added_by_status.beaten'] = 0
    if 'added_by_status.playing' in clusterDf:
        clusterDf['added_by_status.playing'] = clusterDf['added_by_status.playing'].fillna(0)
    else:
        clusterDf['added_by_status.playing'] = 0
    if 'added_by_status.dropped' in clusterDf:
        clusterDf['added_by_status.dropped'] = clusterDf['added_by_status.dropped'].fillna(0)
    else:
        clusterDf['added_by_status.dropped'] = 0
    if 'added_by_status.owned' in clusterDf:
        clusterDf['added_by_status.owned'] = clusterDf['added_by_status.owned'].fillna(0)
    else:
        clusterDf['added_by_status.owned'] = 0
    if 'added_by_status.toplay' in clusterDf:
        clusterDf['added_by_status.toplay'] = clusterDf['added_by_status.toplay'].fillna(0)
    else:
        clusterDf['added_by_status.toplay'] = 0
    if 'added_by_status.yet' in clusterDf:
        clusterDf['added_by_status.yet'] = clusterDf['added_by_status.yet'].fillna(0)
    else:
        clusterDf['added_by_status.yet'] = 0
    if 'released' in clusterDf:
        clusterDf['released'] = clusterDf['released'].apply(lambda x: float(time.mktime(datetime.datetime.strptime(x, '%Y-%m-%d').timetuple())))
    else:
        clusterDf['released'] = float(0)
    if 'tba' in clusterDf:
        clusterDf['tba'] = clusterDf['tba'].apply(lambda x: int(x == True))
    else:
        clusterDf['tba'] = False
    return clusterDf

def runAlgorithm(X):
    # scaling the data to "reduce" mean and variance
    scaler = StandardScaler() 
    X_scaled = scaler.fit_transform(X) 
    
    # normalizing the data
    X_normalized = normalize(X_scaled) 
    X_normalized = pd.DataFrame(X_normalized) 
    
    # reducing dimensions of data from n dimensions to 2
    '''pca = PCA(n_components = 2) 
    X_principal = pca.fit_transform(X_normalized) 
    X_principal = pd.DataFrame(X_principal) 
    X_principal.columns = ['P1', 'P2'] 
    '''
    size = len(X)
    # clustering to get distances of outer clusters
    km = KMeans(n_clusters=size , random_state = 1).fit(X_normalized)

    # returns a matrix of cluster distances
    dists = euclidean_distances(km.cluster_centers_)
    return dists[0] 

def main():
    lines = read_in()
    jsonData = ''.join(lines)
    data = json.loads(jsonData)
    clusterDists = []
    for i in range(len(data)):
        df1 = json_normalize(data[i][0]) # game1
        df2 = json_normalize(data[i][1]) # [related_game1,related_game2,...,related_game18]18
        clusterDf = pd.concat([df1, df2], sort=True).reset_index(drop=True)
        clusterDf = fillNanValues(clusterDf)
        # Getting complex objects
        #!IGNORING platforms = getPlatforms(clusterDf['parent_platforms'])  IGNORING platforms and parent_platforms!
        ratings = getRatings(clusterDf['ratings'])
        clusterDf = pd.merge(clusterDf, ratings, how='outer', left_index=True, right_index=True)
        genres = getGenres(clusterDf['genres'])
        clusterDf = pd.merge(clusterDf, genres, how='outer', left_index=True, right_index=True)
        # Dropping unwanted columns
        clusterDf = clusterDf[clusterDf.columns.drop(list(clusterDf.filter(regex='clip')))]
        clusterDf = clusterDf.drop(columns=['background_image', \
            'user_game', 'stores', 'short_screenshots', 'name', 'slug', 'dominant_color', \
            'saturated_color', 'short_description', 'ratings', 'platforms','parent_platforms', 'genres']) #for now ignoring platform and parent_platform 
        json_dist = json.dumps(runAlgorithm(clusterDf).tolist(), separators=(',', ':'))
        clusterDists.append(json_dist)
    print(clusterDists)
    return clusterDists
# Start process
if __name__ == '__main__':
    main()
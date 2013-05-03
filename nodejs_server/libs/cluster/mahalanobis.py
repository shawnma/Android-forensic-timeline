#!/Library/Frameworks/Python.framework/Versions/2.7/bin/python

import numpy
import numpy.matlib as matlib
from scipy.spatial.distance import mahalanobis
import math

class mahalanobis_helper:

    def __init__(self, dataset):
        # init covariance matrix of the given dataset(samples)
        # each column represents a variable in observation
        covar = numpy.cov(dataset, rowvar = 0) 
        covar_size = int(math.sqrt(covar.size))
        # get inverse of covariance for calculating mahalanobis distance
        if numpy.linalg.det(covar) == 0.0:
            self.covar_inv = numpy.identity(covar_size) # fallback to identity matrix if covar is NOT invertible
        else: # get inverse of covariance matrix
            self.covar_inv = numpy.linalg.inv(covar)

    def getDistance(self, x, y):
        # get the distance of vector x and vector y
        distance = mahalanobis(x, y, self.covar_inv)
        return distance

if __name__ == '__main__':
    # each column is a variable, each row contains observations of variables
    dataset = [
                (0,1,1),
                (1,0,2),
                (0,3,2),
            ]
    mh = mahalanobis_helper(dataset)
    print mh.getDistance(dataset[0], dataset[1])

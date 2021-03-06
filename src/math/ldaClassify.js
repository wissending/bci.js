import { ldaProject } from './ldaProject';

/**
 * Classify an unknown data point.
 * @memberof module:bcijs
 * @function
 * @name ldaClassify
 * @param {object} ldaParams - The parameters for the LDA, computed with the function ldaLearn
 * @param {number[]|number[][]} point - The data point or array of points to be classified.
 * @returns {number} 0 if the first class, 1 if the second class
 * @example
 * let features = [[1,3], [5,2]]; // Example feature vectors
 * let classification = bci.ldaClassify(ldaParams, features[0]); // Outputs a number (0 or 1 depending on class)
 * let classifications = bci.ldaClassify(ldaParams, features); // Outputs an array of classifications
 */
export function ldaClassify(ldaParams, point) {
    let result = ldaProject(ldaParams, point);
    
    if(Array.isArray(result)){
        for(let i = 0; i < result.length; i++){
            result[i] = result[i] < 0 ? 0 : 1;
        }
    } else {
        result = result < 0 ? 0 : 1;
    }

    return result;
}

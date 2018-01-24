var math = require('mathjs');

/**
 * Predict the class of an unknown data point.
 * @param {object} ldaParams - The parameters for the LDA, computed with the function ldaLearn
 * @param {number[]} point - The data point to be classified.
 * @returns {number} value less than 0 if predicted to be in class 1, 0 if exactly inbetween, greater than 0 if class 2
 */
function ldaProject(ldaParams, point) {
	return math.add(math.multiply(point, ldaParams.theta), ldaParams.b);
}

module.exports = ldaProject;
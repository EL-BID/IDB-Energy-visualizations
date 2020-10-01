// Given an array of objects, return an array of distinct values of a field
function getDistinct (array, field) {
    var distinct = [];
    for (var i = 0; i < array.length; i++) {
        d = array[i];
        if (d[field] != undefined) {
            v = d[field];
            if (distinct.indexOf(v) == -1) distinct.push(v);
        }
    }
    return distinct;
}

// Given an array of strings, return an array of unique strings
function getUnique (array) {
    var distinct = {};
    var result = [];
    for (var i in array) {
        if (distinct [array[i]] == undefined) result.push(array[i]);
        distinct [array[i]] = 1;
    }
    return result;
}

// Given two array of objects, returns an array of all elements of the 
// first which do not appear in the second
function getDifference (array1, array2) {
    var result = [];
    array1.forEach (function (x) { 
        if (array2.indexOf(x) < 0) {
            result.push (x);
        }
    });
    return result;
}

// Given an array of objects, return a filtered array of objects where all
// objects satisfy array[field] == value or, if value is undefined, then
// field is regarded as a function that returns true if the element
// is to be kept
function getFiltered(array, field, value) {
    var filtered = [];
    if (value == undefined) {
        for (var i in array) {
            if (field (array[i])) filtered.push (array[i])
        }
    }
    else {
        for (var i in array) {
            d = array[i];
            if (d[field] == value) {
                filtered.push(d)
            }
        }
    }
    return filtered;
}


// Given an array of objects, select each group that have the same
// value for the given field and returns an array of arrays of objects (one
// for each group)
function getGrouped (array, field) {
    var groups = [];
    for (var i in array) {
        var key = array[i][field];
        if (groups [key] == undefined) { 
            groups[key] = [array[i]];
        }
        else {
            groups[key].push (array[i]);
        }
    }
    return groups;
} 

// Given an array of objects, processes each object with function f
// and returns an array with the processed objects
function getMapped (array, f) {
    var mapped = [];
    for (var i in array) {
        mapped.push(f (array [i]));
    }
    return mapped;
}

// Given an array of objects, return the sum of the
// value of a given field
function getSum (array, field) {
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
        d = array[i];
        if (d[field] != undefined) {
            sum += d[field];
        }
    }
    return sum;
}



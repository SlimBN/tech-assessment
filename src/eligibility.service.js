class EligibilityService {

  /**
 * PRIVATE FUNCTION THAT CHECKS FOR CONDITIONS CONFORMITY
 *
 * @param {*} cartValue - The value from the cart
 * @param {*} criteriaValue - The criteria value to compare against
 * @param {string} condition - The type of condition
 * @returns {boolean} - True if the cart value meets the criteria condition, otherwise false
 */
_checkCondition(cartValue, criteriaValue, condition) {

  // A good old switch statement to handle different types of conditions
  switch (condition) {

    // Simple comparison and equality checks
    case "gt":
      return cartValue > criteriaValue;
    case "lt":
      return cartValue < criteriaValue;
    case "gte":
      return cartValue >= criteriaValue;
    case "lte":
      return cartValue <= criteriaValue;

    // Complex logical conditions
    case "and":
      // For 'and', we iterate through all sub-conditions to ensure they're all true
      for (const criterion in criteriaValue) {
        if (!this._checkCondition(cartValue, criteriaValue[criterion], criterion)) {
          return false;
        }
      }
      return true;

    case "in":
      // For 'in', we check if cartValue exists in the criteriaValue array
      if (Array.isArray(cartValue)) {
        for (const subValue of cartValue) {
          if (criteriaValue.includes(subValue)) {
            return true;
          }
        }
        return false;
      }
      // If cartValue isn't an array, simply check if it's in criteriaValue
      return criteriaValue.includes(cartValue);

    case "or":
      // For 'or', we recursively check any sub-conditions until one evaluates to true
      for (const criterion in criteriaValue) {
        if (this._checkCondition(cartValue, criteriaValue[criterion], criterion)) {
          return true;
        }
      }
      return false;

    // Handle any unexpected condition type
    default:
      return false;
  }
}


  /**
   * PRIVATE FUNCTION THAT HELPS US ACCESS NESTED OBJECT VALUES USING DOT NOTATION
   *
   * @param {object} object - The object to traverse
   * @param {string} key - The dot-separated key to access within the object
   * @returns {*} - The value found at the specified key
   */
  _getObjectValue(object, key) {

    // Split the dot-separated key into individual conditions
    const conditions = key.split(".");

    // Initialize the value to the root object
    let value = object;

    // Iterate through each condition in the conditions array
    for (const condition of conditions) {

      // Check if the current value is undefined, it happens
      if (value === undefined) {

        // If so, return undefined
        return undefined;
      }

      // If the current value is an array, collect values for the current key
      if (Array.isArray(value)) {

        // Initialize an array to store values

        const valuesArray = [];

        // Iterate through each item in the array
        for (const item of value) {

          // Check if the item has the current condition as a property
          if (item && item.hasOwnProperty(condition)) {

            // If yes, push the value at the current condition to the valuesArray
            valuesArray.push(item[condition]);
          }

        }

        // Update the value to be the collected values for the current key
        value = valuesArray;
      } else {

        // If the current value is an object, access the property for the current key
        value = value[condition];
      }
    }

    // Return the final value found at the specified key
    return value;
  }


  /**
 * PRIVATE FUNCTION THAT VALIDATES THE CONFORMITY OF A CART VALUE WITH THE CRITERIAS
 *
 * @param {*} cartValue - The value from the cart
 * @param {*} criteriaValue - The value to compare against
 * @returns {boolean} - True if the cart value meets the criteria, otherwise false
 */
_validateObject(cartValue, criteriaValue) {

  // Check if the criteriaValue is not an object (simple comparison)
  if (typeof criteriaValue !== "object") {
    if (Array.isArray(cartValue)) {

      // If cartValue is an array, I check if it includes the criteriaValue
      return cartValue.includes(criteriaValue);
    } else {

      // If cartValue is not an array, I perform a basic comparison
      return cartValue == criteriaValue;
    }
  } else {

    // If criteriaValue is an object, it represents a nested condition
    // Recursively check the nested condition with _checkCondition
    const nestedConditionValue = Object.values(criteriaValue)[0];
    const nestedConditionType = Object.keys(criteriaValue)[0];
    return this._checkCondition(cartValue, nestedConditionValue, nestedConditionType);
  }
}

  /**
   * This function compares cart data with criteria to determine eligibility.
   * If all criteria are satisfied, it returns true; otherwise, it returns false.
   *
   * @param cart
   * @param criteria
   * @return {boolean}
   */
  isEligible(cart, criteria) {
    
    // If there are no criterias to check with, well I guess everything is good and eligible
    if (Object.keys(criteria).length === 0) {
      return true;
    }

    // If the cart is empty, it cannot meet any criteria, so it's not eligible
    if (Object.keys(cart).length === 0) {
      return false;
    }

    // Iterate through each criterion in the criteria object
    for (var criterion in criteria) {
      // Retrieve the corresponding value from the cart
      const cartValue = this._getObjectValue(cart, criterion);
      const criteriaValue = criteria[criterion];

      // If the cart value is undefined we return false
      if (cartValue == undefined) {
        return false;
      }
      // Validate the cart value against the criteria using _validateObject
      if (!this._validateObject(cartValue, criteriaValue)) {
        return false;
      }
    }

    // If all criteria are met, we consider the cart eligible
    return true;
  }
}

module.exports = {
  EligibilityService,
};

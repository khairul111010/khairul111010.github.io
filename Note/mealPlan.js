let count = 0;
let meal = [],
  data = [],
  food = [];
for (let index = 0; index < mealPlanList.length; index++) {
  const element = mealPlanList[index];
  for (let i = 0; i < element.data.length; i++) {
    for (let j = 0; j < element.data[i].ingredient.length; j++) {
      food.push({
        ingredient: element.data[i].ingredient[j].food_id,
        ingredient_amount: element.data[i].ingredient[j].amount,
        protein: element.data[i].ingredient[j].protein,
        fats: element.data[i].ingredient[j].fats,
        carbohydrates: element.data[i].ingredient[j].carbohydrates,
      });
    }
    data.push({
      meal_type_cat_id: element.data[i].category_id,
      block_id: element.data[i].block_id,
      title: element.data[i].meal_type,
      protein: element.data[i].protein,
      fats: element.data[i].fats,
      carbohydrates: element.data[i].carbohydrates,
      food: food,
    });

    console.log({
      block_category_id: element.block_category_id,
      block_id: element.data[i].block_id,
      meal_type_cat_id: element.data[i].category_id,
      week_day_id: element.day_id,
      title: element.data[i].meal_type,
      user_id: req.auth.id,
      protein: element.data[i].protein,
      fats: element.data[i].fats,
      carbohydrates: element.data[i].carbohydrates,
      count: count++,
    });
    food = [];
  }
  meal.push({
    user_id: req.auth.id,
    week_day_id: element.day_id,
    block_category_id: element.block_categories_id,
    data: data,
  });
  data = [];
}
res.json(meal);

console.log("_______________________________");
const customMealPlanUserDataExists = (user_id) => {
  return MealPlan.findAll({
    where: { user_id: user_id },
  });
};
customMealPlanUserDataExists(element.user_id).then((response) => {
  if (response) {
    response.map((r) => {
      MealPlan.destroy({
        where: {
          id: r.dataValues.id,
          user_id: element.user_id,
        },
      }).then((result) => {
        Ingredient.destroy({
          where: {
            item_id: r.dataValues.id,
          },
        });
      });
    });
  } else {
  }
});

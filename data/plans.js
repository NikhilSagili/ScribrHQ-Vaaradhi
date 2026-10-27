/* Breakfast and meal plan CONCEPTS for discussion with Vaaradhi Farms.

   Status: PROPOSED. None of these are Vaaradhi offerings. Menu, prices, serving sizes,
   kitchen capacity, delivery or pickup, and cutoff times are all unconfirmed.
   Do not add dishes, ingredients, nutrition claims or prices until the owner confirms them.

   Edit after the owner meeting:
   - menu:          list of confirmed items, or null while unconfirmed
   - pricePerServing / pricePerWeek: number in INR, or null while unconfirmed
   - capacityPerDay: servings the kitchen can fulfil per day, or null while unknown
   - days:          default delivery days (0 = Sun ... 6 = Sat)
   - fulfilment:    'delivery', 'pickup' or 'either', or null while unknown */
window.MEAL_PLANS = {
  status: 'proposed',
  unconfirmedLabel: 'Menu and pricing to be confirmed',
  plans: [
    {
      id: 'healthy-start',
      name: 'Healthy Start',
      summary: 'A recurring breakfast on the days the customer chooses.',
      schedule: 'custom',            // customer picks days
      days: [1, 2, 3, 4, 5, 6],
      servingsOptions: [1, 2],
      menu: null, pricePerServing: null, pricePerWeek: null, capacityPerDay: null, fulfilment: null,
      status: 'concept',
    },
    {
      id: 'workday-breakfast',
      name: 'Workday Breakfast',
      summary: 'Breakfast on selected weekdays only.',
      schedule: 'weekdays',
      days: [1, 2, 3, 4, 5],
      servingsOptions: [1, 2],
      menu: null, pricePerServing: null, pricePerWeek: null, capacityPerDay: null, fulfilment: null,
      status: 'concept',
    },
    {
      id: 'family-breakfast-box',
      name: 'Family Breakfast Box',
      summary: 'A multi-serving option for households.',
      schedule: 'custom',
      days: [0, 6],
      servingsOptions: [3, 4, 5],
      menu: null, pricePerServing: null, pricePerWeek: null, capacityPerDay: null, fulfilment: null,
      status: 'concept',
    },
    {
      id: 'weekly-healthy-mix',
      name: 'Weekly Healthy Mix',
      summary: 'A flexible weekly selection the customer can adjust.',
      schedule: 'weekly',
      days: [1],
      servingsOptions: [1, 2, 3],
      menu: null, pricePerServing: null, pricePerWeek: null, capacityPerDay: null, fulfilment: null,
      status: 'concept',
    },
  ],
};

<template>
  <div id="about" class="mt-3">
    <h1> About boutify. </h1>

    <b-container>
      <p class="">
        <h4>Why are we doing this?</h4>

        <p class="text-left">
          explain here
        </p>


      <p>
        <h5>You can unlock the following animals based on the number of points you have:</h5>
      </p>

      <b-container fluid class="p-4">
        <b-row>
          <b-col v-for="lev in levels" v-if="lev.img">
            <div >
              <b-img fluid class="pokemon" :src="lev.img_grey" alt="Thumbnail"/>
              <br>
              Level {{lev.level}}
              <br>
              <span>{{lev.min}} points</span>
            </div>
          </b-col>
        </b-row>
      </b-container>

    </b-container>
    <div class="bottom text-center">
      <small> * icons on this site were
        <a href='https://www.freepik.com/free-vector/cute-woodland-animals_1585897.htm'>Designed by Freepik</a>
      </small>
    </div>
  </div>

</template>

<style>

.pokemon{
  min-width: 25px;
  min-height: 25px;
  width: 100px;
  height: 100px;
}


#about {
  min-height: 100vh;
}

</style>

<script>
export default {
  name: 'about',
  data() {
    return {
      count: 1,
    };
  },
  props: ['levels'],
};
</script>

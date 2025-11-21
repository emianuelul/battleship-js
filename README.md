# Battleship

Personal project done as a way to put into practice some TDD and also put into practice what I've learned along the way on the JS Course from The Odin Project. Took me about a week, might return later to add / tweak stuff. Style is basic but that wasn't the main focus.

Original project along with commit history was on a different repo but it didn't allow me to push to gh-pages so I tried creating a new repo.

You can play the game [here](js-battleship-iemi.vercel.app/).

## THINGS I LEARNED

1. How OOP works in JavaScript
2. How to divide bits of code in their respective module so as to be more organized
3. How to create a small 'AI' that takes the most optimal choices
4. Manipulating data

## How to use

- Press start to start the game
- You can move pieces around by dragging them, if you place it in an invalid position, it snaps back to it's original position
- You can also randomize your ships if you can't decide your tactic
- Click the enemy board to try and hit their ships
- You will take turns with a CPU I've written from ground up, taking smart choices based on it's hit
- If you hit a ship, the square will turn red and you can keep going untill you miss.

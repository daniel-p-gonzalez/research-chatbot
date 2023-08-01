
//     const reply = await fetch(, {
//         method: 'POST',
//         body: JSON.stringify({
//             'model': 'vicuna-7b-v1.3',
//             'prompt': PROMPT + message + SUFFIX,
//             'temperature': 0.7,
//             'repetition_penalty': 1.0,
//             'top_p': 1.0,
//             'max_new_tokens': 512,
//             'stop': null,
//             'stop_token_ids': null,
//             'echo': false,
//         })
//     }).then(res => {
//         const pipeline = res.body
//         if (!pipeline) throw "no body?"
// //                .pipe(parser())
// //                .pipe(pick({ filter: 'data' }))
//       //          .pipe(new StreamArray());

//             pipeline.on('data', (s) => {
//                 console.log(`line: ${s}`)
//             });
//             pipeline.on('end', () => console.log('Done!'));

    //         })

//}

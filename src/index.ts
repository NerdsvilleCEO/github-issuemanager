import { Application } from 'probot' // eslint-disable-line no-unused-vars

const bot_name = "IssueManagerBot"
export = (app: Application) => {
 app.on('issues.opened', async (context) => {
   console.log("Test")
   const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
   await context.github.issues.createComment(issueComment)
 })
 app.on('issue_comment.created', async (context) => {
   // Ignore if from a bot
   if (context.payload.comment.user.type === 'Bot') {
     return
   }

   const mentions = context.payload.comment.body.includes(bot_name)
   if (mentions) {
    app.log.info('mention', bot_name)
    await context.github.issues.createComment(context.issue({
      body: `:wave: Hello World! :heart:`
    }))
   }
 })
}
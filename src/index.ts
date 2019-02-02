import { Application } from 'probot' // eslint-disable-line no-unused-vars

async function close(context: any) {
  if(context.payload.comment.user.login != context.payload.repository.owner.login) {
    await context.github.issues.createComment(context.issue({
      body: `Your user is not allowed to perform this operation`
    }))
  } else {
    const params = {
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      number: context.payload.issue.number
    }
    await context.github.issues.update({
      ...params,
      state: 'closed'
    })
  }
}

async function run_action(context: any) {
  // TODO: Think of a better way to handle this, could prototypes be used to handle this?
  let actions = [
    {
    "name": "close",
    "function": close
    }
  ]
  let phrase = context.payload.comment.body.toLowerCase().split(" ").splice(1).join("_")
  let ran = false
  actions.forEach((action) => {
    if (phrase.includes(action.name)) {
      console.log(action.function(context))
      ran = true
    }
  })
  if(!ran) {
    await context.github.issues.createComment(context.issue({
      body: `This action is not implemented`
    }))
  }
}

const bot_name = "IssueManagerBot"
export = (app: Application) => {
 app.on('issues.opened', async (context) => {
   const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
   await context.github.issues.createComment(issueComment)
 })
 app.on('issue_comment.created', async (context) => {
   // Ignore if from a bot
   if (context.payload.comment.user.type === 'Bot') {
     return
   }

   let comment = context.payload.comment
   const mentions = comment.body.includes(bot_name)
   if (mentions) {
    app.log.info('mention', bot_name)

    // Figure out way to pull users allowed to use bot actions, would this be 
    // collaborators w/ write access on repo?

    // Syntax PoC:
    // - "Add label" untriaged
    // - "Remove label" untriaged
    run_action(context)
   }
 })
}
import TemplatePointers from "./components/TemplatePointers"



function LandingIntro(){

    return(
        <div className="hero min-h-full rounded-l-xl bg-base-200">
            <div className="hero-content py-12">
              <div className="max-w-md">

              {/* <h1 className='text-3xl text-center font-bold '><img src="/logo192.png" className="w-12 inline-block mr-2 mask mask-circle" alt="dashwind-logo" />RPS</h1> */}

                <div className="text-center"><img src="https://avatars.githubusercontent.com/u/68688703?s=200&v=4" alt="Wazo" className="w-48 inline-block"></img></div>
              
              {/* Importing pointers component */}
              {/* <TemplatePointers /> */}
              
              </div>

            </div>
          </div>
    )
      
  }
  
  export default LandingIntro
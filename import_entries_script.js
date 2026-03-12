// Paste this entire script in your Chrome extension console (F12 -> Console tab)
(function() {
  console.log('🔄 Starting import from phone server...');
  
  const serverResponse = {
  "entries": [
    {
      "id": "5d6872fd-6b85-463b-ab12-7301165c934a",
      "time": "2026-03-11T05:03:51.199Z",
      "note": "Reached ofc plugged in",
      "createdAt": "2026-03-11T05:03:51.201Z",
      "updatedAt": "2026-03-11T05:03:51.201Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "59d9a2d5-e7ac-45c4-83e1-1cd80f33cc78",
      "time": "2026-03-11T04:19:39.834Z",
      "note": "Had my breakfast and cooked my lunch",
      "createdAt": "2026-03-11T04:19:39.840Z",
      "updatedAt": "2026-03-11T04:19:39.841Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "82c790ea-9546-4943-a61f-867dd5a2ffff",
      "time": "2026-02-20T11:09:02.021Z",
      "note": "Work",
      "createdAt": "2026-02-20T11:09:02.022Z",
      "updatedAt": "2026-02-20T11:09:02.023Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "5e677807-51d3-4967-a219-fafc57a66250",
      "time": "2026-02-19T09:08:44.534Z",
      "note": "Solved package issue and started maxistd",
      "createdAt": "2026-02-19T09:08:44.537Z",
      "updatedAt": "2026-02-19T09:08:44.537Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "eed610e6-bb6c-46bd-afca-6d9a149047b9",
      "time": "2026-02-19T06:32:26.962Z",
      "note": "What it is like to capture human sadness",
      "createdAt": "2026-02-19T06:32:26.962Z",
      "updatedAt": "2026-02-19T06:32:26.962Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "9e756bd0-49eb-4d1a-98a2-26c4b82dc513",
      "time": "2026-02-19T05:34:08.201Z",
      "note": "Came back. Now i can determins  how much time it took and is doing blinkit more value more money",
      "createdAt": "2026-02-19T05:34:08.202Z",
      "updatedAt": "2026-02-19T05:34:08.202Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "4b2f125f-45df-4f36-af9f-f6612fdad95c",
      "time": "2026-02-19T05:16:13.653Z",
      "note": "Going to Buy bread",
      "createdAt": "2026-02-19T05:16:13.654Z",
      "updatedAt": "2026-02-19T05:16:13.655Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "0b64f1ee-5d15-4983-a7e3-5748f658141c",
      "time": "2026-02-19T05:05:15.858Z",
      "note": "I worked on the sound module. Had some success. I am getting drawn to it. But I need to do my work as well. I will step away from it for now",
      "createdAt": "2026-02-19T05:05:15.862Z",
      "updatedAt": "2026-02-19T05:05:15.862Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "4d1a0263-0a99-47e8-a5c1-eacd756e84e1",
      "time": "2026-02-18T22:07:03.661Z",
      "note": "Damm so i was using chatgpt to implement the data through sound but failed. Then I went to github. Installed it in my mac using the agent and bam everything was working. Open source is fucking amazing. I feel so happy right now I was in a flow state. I like building things. I am so fucking excited",
      "createdAt": "2026-02-18T22:07:03.663Z",
      "updatedAt": "2026-02-18T22:07:03.663Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "c8cb9bae-f27b-437d-88ad-561d2f1e9329",
      "time": "2026-02-18T16:21:41.106Z",
      "note": "Had my dinner can plug into the table now",
      "createdAt": "2026-02-18T16:21:41.109Z",
      "updatedAt": "2026-02-18T16:21:41.109Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "964b5e18-904f-457c-8ebb-cad512610168",
      "time": "2026-02-18T15:09:34.700Z",
      "note": "Came back from boxing. Really enjoyed my time there. I am mixing up with people, I loved sparring getting betten. Today I did 50 pushups. \nBefore going to gym I and anuj went for tea, there we discussed finances. We forgot to pay 30INR while coming  back from gym I paid. I could have skipped it but the trust in socity have increases incrementally",
      "createdAt": "2026-02-18T15:09:34.703Z",
      "updatedAt": "2026-02-18T15:09:34.703Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "06001f1f-85ad-4d0c-9e45-164d352d4b1e",
      "time": "2026-02-18T13:14:19.653Z",
      "note": "Worked on the avation setup. Currently going to gym",
      "createdAt": "2026-02-18T13:14:19.653Z",
      "updatedAt": "2026-02-18T13:14:19.653Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "350f7e19-3e0e-43de-aadb-ca7e3d1311ef",
      "time": "2026-02-18T11:36:50.846Z",
      "note": "Came back from office",
      "createdAt": "2026-02-18T11:36:50.847Z",
      "updatedAt": "2026-02-18T11:36:50.847Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "8bbd8da8-6dc3-4290-8ffb-b9d412eb0bfd",
      "time": "2026-02-18T11:01:10.638Z",
      "note": "Leaving from office. I am hitting deadend in setting up avation env.",
      "createdAt": "2026-02-18T11:01:10.639Z",
      "updatedAt": "2026-02-18T11:01:10.639Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "08dbd60e-ce00-44b3-95e4-14a808af8f97",
      "time": "2026-02-18T10:28:13.027Z",
      "note": "Meeting eith darshan",
      "createdAt": "2026-02-18T10:28:13.028Z",
      "updatedAt": "2026-02-18T10:28:13.028Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "0b48ec92-6161-47f3-8f11-13268808f7e2",
      "time": "2026-02-18T09:51:32.012Z",
      "note": "Starting to work in keys wedding video",
      "createdAt": "2026-02-18T09:51:32.012Z",
      "updatedAt": "2026-02-18T09:51:32.012Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "0b8444b1-0177-4448-a9e5-8a1196558ac2",
      "time": "2026-02-18T09:48:51.259Z",
      "note": "Y",
      "createdAt": "2026-02-18T09:48:51.259Z",
      "updatedAt": "2026-02-18T09:48:51.260Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "adc95bcc-6eae-4de7-86f1-7f3bc42c9259",
      "time": "2026-02-18T09:48:08.757Z",
      "note": "This is a new entrt",
      "createdAt": "2026-02-18T09:48:08.757Z",
      "updatedAt": "2026-02-18T09:48:08.757Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "1a1ca483-f571-4a78-81eb-871d2dd47987",
      "time": "2026-02-18T09:47:13.014Z",
      "note": "Jfjd",
      "createdAt": "2026-02-18T09:47:13.014Z",
      "updatedAt": "2026-02-18T09:47:13.015Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "d4a4268a-4f06-44eb-afe2-4b8e9167795a",
      "time": "2026-02-18T09:32:59.958Z",
      "note": "New ui",
      "createdAt": "2026-02-18T09:32:59.963Z",
      "updatedAt": "2026-02-18T09:32:59.964Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "73f8fdf9-e78d-43bd-987f-42c3086d7798",
      "time": "2026-02-18T09:17:18.894Z",
      "note": "Solving hotspot issue",
      "createdAt": "2026-02-18T09:17:18.896Z",
      "updatedAt": "2026-02-18T09:17:18.897Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "2eb06a85-1cf8-428b-a243-22d277867ed2",
      "time": "2026-02-18T09:14:59.419Z",
      "note": "I am making this entry via usb debugging",
      "createdAt": "2026-02-18T09:14:59.424Z",
      "updatedAt": "2026-02-18T09:14:59.425Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "1f4da35e-2ef0-4054-83c3-4781d89783b2",
      "time": "2026-02-18T08:07:21.985Z",
      "note": "Had lunch. Walking back from maple",
      "createdAt": "2026-02-18T08:07:21.986Z",
      "updatedAt": "2026-02-18T08:07:21.987Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "f5e58fe0-4076-4731-8e5d-741cfb20b99f",
      "time": "2026-02-18T07:46:17.777Z",
      "note": "Walked till maple",
      "createdAt": "2026-02-18T07:46:17.778Z",
      "updatedAt": "2026-02-18T07:46:17.778Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "28fec59f-8cd1-4593-b9c4-243c30792c6d",
      "time": "2026-02-18T07:43:01.262Z",
      "note": "Reached ofc",
      "createdAt": "2026-02-18T07:43:01.264Z",
      "updatedAt": "2026-02-18T07:43:01.265Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "7ed89249-a4f2-4df6-a14a-3be64d3ab601",
      "time": "2026-02-18T07:10:00.661Z",
      "note": "Getting ready for office now. I saw Aditi Shivhare's whatsapp status she went on her cousion's wedding. I felt I cant afford this type of wedding. Feeling , I can't discribe the feeling. Also I am frequently checking Aayushi Singh's instagram from my new public account. The thought being she will doscover my IG account. This thought is tempting even though I should have moved on and things like these shouldn't matter.",
      "createdAt": "2026-02-18T07:10:00.661Z",
      "updatedAt": "2026-02-18T07:10:00.662Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "2d5a09e6-8feb-4038-b6dc-528252bf358c",
      "time": "2026-02-18T05:34:17.168Z",
      "note": "Took bath",
      "createdAt": "2026-02-18T05:34:17.169Z",
      "updatedAt": "2026-02-18T05:34:17.170Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "bd4c9496-3a52-43bc-9bd6-ba0f1dabbbf4",
      "time": "2026-02-18T05:03:28.048Z",
      "note": "Drank chaas and scrolled IG",
      "createdAt": "2026-02-18T05:03:28.050Z",
      "updatedAt": "2026-02-18T05:03:28.050Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "914458b5-266b-4be1-bc77-692d61efd8cf",
      "time": "2026-02-18T04:35:18.432Z",
      "note": "Came back from short ride. Had poha and brought milk and chaas with me",
      "createdAt": "2026-02-18T04:35:18.434Z",
      "updatedAt": "2026-02-18T04:35:18.434Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "76d2cbdd-1ef1-49d2-a591-8583aa4dd1ae",
      "time": "2026-02-18T04:07:09.566Z",
      "note": "Had 4 eggs",
      "createdAt": "2026-02-18T04:07:09.567Z",
      "updatedAt": "2026-02-18T04:07:09.567Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "af262184-3127-4787-aa19-9ebccc3f7ca9",
      "time": "2026-02-18T03:53:50.923Z",
      "note": "Sorted travels for Sanket's travel",
      "createdAt": "2026-02-18T03:53:50.927Z",
      "updatedAt": "2026-02-18T03:53:50.927Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "c9ce6602-15e5-4ab1-9c92-42a1b0840a61",
      "time": "2026-02-18T03:29:47.698Z",
      "note": "Washroom",
      "createdAt": "2026-02-18T03:29:47.699Z",
      "updatedAt": "2026-02-18T03:29:47.699Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "cee856c8-d0e9-4be8-9d09-53d1d29a6f95",
      "time": "2026-02-18T03:02:31.560Z",
      "note": "Was just lying in the bed. Now got out of bed",
      "createdAt": "2026-02-18T03:02:31.562Z",
      "updatedAt": "2026-02-18T03:02:31.562Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "b1569b84-3207-44dd-a112-6ddd4250d2e1",
      "time": "2026-02-18T02:52:45.313Z",
      "note": "Woke up now",
      "createdAt": "2026-02-18T02:52:45.313Z",
      "updatedAt": "2026-02-18T02:52:45.313Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "1f9cf2a5-652a-4d63-ba4b-2ce09d8e7895",
      "time": "2026-02-17T17:50:39.102Z",
      "note": "Should call it a day now",
      "createdAt": "2026-02-17T17:50:39.104Z",
      "updatedAt": "2026-02-17T17:50:39.105Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "82973a65-81f5-4f57-81f4-26da2831f762",
      "time": "2026-02-17T15:39:47.821Z",
      "note": "I have brought this app to the usable state. Now I should not invest more time and actually do my work",
      "createdAt": "2026-02-17T15:39:47.821Z",
      "updatedAt": "2026-02-17T15:39:47.821Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "bc93e339-916a-4319-8c71-40588ee5765a",
      "time": "2026-02-17T14:30:33.570Z",
      "note": "333e",
      "createdAt": "2026-02-17T14:30:33.570Z",
      "updatedAt": "2026-02-17T14:30:33.571Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "4467051f-c3c4-4df6-b725-be4d13ed5204",
      "time": "2026-02-17T14:30:05.100Z",
      "note": "Laplaptop",
      "createdAt": "2026-02-17T14:30:05.104Z",
      "updatedAt": "2026-02-17T14:30:05.104Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "c8334eb4-da90-478a-979d-0f0229f51e47",
      "time": "2026-02-17T13:58:48.427Z",
      "note": "This is my entry from mobile app",
      "createdAt": "2026-02-17T13:58:48.431Z",
      "updatedAt": "2026-02-17T13:58:48.432Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "0da53871-84e3-4b89-8c12-d073a3775c89",
      "time": "2026-02-17T13:25:21.969Z",
      "note": "Testing this from my phone",
      "createdAt": "2026-02-17T13:25:21.971Z",
      "updatedAt": "2026-02-17T13:25:21.972Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "57c17524-fc94-42e5-94ac-8f967f2126da",
      "time": "2026-02-17T12:13:34.019Z",
      "note": "i  m fking awedome",
      "createdAt": "2026-02-17T12:13:34.020Z",
      "updatedAt": "2026-02-17T12:13:34.020Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "88ff69c5-1fea-4138-9eba-d953480d5c6f",
      "time": "2026-02-17T11:40:32.768Z",
      "note": "my first entry from phone",
      "createdAt": "2026-02-17T11:40:32.769Z",
      "updatedAt": "2026-02-17T11:40:32.769Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "test-123",
      "time": "2026-02-17T11:50:00.000Z",
      "note": "Test from curl",
      "createdAt": "2026-02-17T11:50:00.000Z",
      "updatedAt": "2026-02-17T11:50:00.000Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "new-entry-456",
      "time": "2026-02-17T11:50:30.000Z",
      "note": "New entry from Chrome extension test",
      "createdAt": "2026-02-17T11:50:30.000Z",
      "updatedAt": "2026-02-17T11:50:30.000Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "ui-test-999",
      "time": "2026-02-17T11:54:55.000Z",
      "note": "This should appear in UI instantly!",
      "createdAt": "2026-02-17T11:54:55.000Z",
      "updatedAt": "2026-02-17T11:54:55.000Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "fan-message-001",
      "time": "2026-02-17T11:56:51.000Z",
      "note": "I am a huge fan of you sir",
      "createdAt": "2026-02-17T11:56:51.000Z",
      "updatedAt": "2026-02-17T11:56:51.000Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "b7a6eccd-1558-45c8-9dea-546bba6f4ecc",
      "time": "2026-02-17T09:09:45.498Z",
      "note": "Last hours I spend on getting the mobile app up and figuring out the way to code it. I have landed on BOB + android studio. I have cooked lunch and watch half EP of GOT",
      "createdAt": "2026-02-17T09:09:45.498Z",
      "updatedAt": "2026-02-17T09:09:45.498Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "c154b249-dd0f-4bed-b824-24e1341580c6",
      "time": "2026-02-17T04:09:00.522Z",
      "note": "Working on the phone app for this extension",
      "createdAt": "2026-02-17T04:09:00.522Z",
      "updatedAt": "2026-02-17T04:09:00.522Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "d25266c3-2ee6-4150-8ccc-0564a70fcc4d",
      "time": "2026-02-16T18:24:41.506Z",
      "note": "I came back from office but I was feeling exhausted. So i scrolled for a bit I should have gone to Gym earlier. When I went to gym I started to feel great again. Then I went out to eat and went with Anuj on a bike ride. Then came back to home scrolled more then cleaned chicken. Now its 11:54pm",
      "createdAt": "2026-02-16T18:24:41.506Z",
      "updatedAt": "2026-02-16T18:24:41.506Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "87f4aa68-956e-4c14-bd32-7dc81295c058",
      "time": "2026-02-16T10:57:55.655Z",
      "note": "I am currently debugging why the new query I provided in sp epic is not working. Also my avation zip is downloaded and currently android studio is getting up and started",
      "createdAt": "2026-02-16T10:57:55.655Z",
      "updatedAt": "2026-02-16T10:57:55.655Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "37f944f9-d968-4e8e-b4ce-b28a867377e7",
      "time": "2026-02-16T09:57:08.708Z",
      "note": "SHitt I was hitting it wrong folder",
      "createdAt": "2026-02-16T09:57:08.708Z",
      "updatedAt": "2026-02-16T09:57:08.708Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "1579b4c3-e4c0-4193-bb01-93ffa40af95a",
      "time": "2026-02-16T09:33:25.246Z",
      "note": "Since the bin file is talking too long to donwload I am currently switched task to sp epic. I am unable to run updatedb script. It's weird did something breaK?",
      "createdAt": "2026-02-16T09:33:25.246Z",
      "updatedAt": "2026-02-16T09:33:25.246Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "70978433-5879-4987-bb52-d8725ea0090c",
      "time": "2026-02-16T09:01:56.161Z",
      "note": "Now I am working to setup my avation env. Let's see how long it takes. Right now I am downloading the zip",
      "createdAt": "2026-02-16T09:01:56.161Z",
      "updatedAt": "2026-02-16T09:01:56.161Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "e54b4535-b1f7-41cc-83a5-3622be842b47",
      "time": "2026-02-16T09:00:36.195Z",
      "note": "I spend my time from last checking in checking the feasibility of this extension to connect to google drive. I should probably pause this and work on my office stuff..I have lot of things on that plate too",
      "createdAt": "2026-02-16T09:00:36.195Z",
      "updatedAt": "2026-02-16T09:00:36.195Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "a2a572d9-ed20-43f9-8cf9-55efa16f2be3",
      "time": "2026-02-16T08:33:57.461Z",
      "note": "I left for office at 1:55pm. It would have took me 15 mins to get ready for office. I reached office in 15 mins. Then I had my lunch and went of a short walk round",
      "createdAt": "2026-02-16T08:33:57.461Z",
      "updatedAt": "2026-02-16T08:33:57.461Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "be8b7be4-0f03-4e4d-a782-2afbf9f974b6",
      "time": "2026-02-16T06:51:24.051Z",
      "note": "I coded merge sort and dry ran it, It took me a log of time to dry run the code but I don't have the habit of dry running the code which I should develop also while coding I made 2 mistakes in the code. It was a rookie mistake but I need to spend more time codeing to get good at.",
      "createdAt": "2026-02-16T06:51:24.051Z",
      "updatedAt": "2026-02-16T06:51:24.051Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "4293c8c5-0aaf-45e7-942e-289be64ba63f",
      "time": "2026-02-16T06:21:16.754Z",
      "note": "Last 25 mins were spend in researching on manim library and coming up with a workflow of dsa. Then I went to youtube, there was a video on Pam bondi. It intrigued me so I clicked it. Currently I am doing merge sort",
      "createdAt": "2026-02-16T06:21:16.754Z",
      "updatedAt": "2026-02-16T06:21:16.754Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "0ac0c3be-a577-45e7-a979-639d1a8927fa",
      "time": "2026-02-16T05:55:02.957Z",
      "note": "Took the break, I got my hands on my phone that led to the increased time in the break, I should have not done it",
      "createdAt": "2026-02-16T05:55:02.957Z",
      "updatedAt": "2026-02-16T05:55:02.957Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "3a56635a-5915-4136-84e8-0f59fd6d35c0",
      "time": "2026-02-16T05:19:23.712Z",
      "note": "I spend my last 20 mins working on my jenkins extension. \nDynamic sandbox is not working I will come back and check in later",
      "createdAt": "2026-02-16T05:19:23.712Z",
      "updatedAt": "2026-02-16T05:19:23.712Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "333d3419-2214-4ce4-af7b-4f5537193b4d",
      "time": "2026-02-16T04:58:58.958Z",
      "note": "I gathered the information on how to build dynamic sandbox of transportation, in break I rinsed the utensils and cleared the blockage of sink",
      "createdAt": "2026-02-16T04:58:58.958Z",
      "updatedAt": "2026-02-16T04:58:58.958Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "4554917d-bfe7-407f-b5df-ade2787c86d5",
      "time": "2026-02-16T04:23:27.881Z",
      "note": "Currently I am doing some housekeeping for my work related tasks. I had to briefly go to youtube to check something. I started to watch a video from my recommendations but reverted back to work. It was a close call",
      "createdAt": "2026-02-16T04:23:27.881Z",
      "updatedAt": "2026-02-16T04:23:27.881Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "9d9b65de-7ed0-45c9-99d5-adaa6a890b82",
      "time": "2026-02-16T04:01:52.240Z",
      "note": "Had breakfast (healthy), showered",
      "createdAt": "2026-02-16T04:01:52.240Z",
      "updatedAt": "2026-02-16T04:01:52.240Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "944227fd-6113-49dc-bb24-b7bfe8819d56",
      "time": "2026-02-16T02:57:50.905Z",
      "note": "GOOD MORNING. JOURNLING",
      "createdAt": "2026-02-16T02:57:50.905Z",
      "updatedAt": "2026-02-16T02:57:50.905Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "58ad3a37-3dde-4c6f-9b39-fbdb593ae05d",
      "time": "2026-02-14T19:05:36.614Z",
      "note": "HIGHH",
      "createdAt": "2026-02-14T19:05:36.614Z",
      "updatedAt": "2026-02-14T19:05:36.614Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "8907b6d4-07b2-476a-b5bb-a8676cd2c0e7",
      "time": "2026-02-14T18:05:30.937Z",
      "note": "Pixelated...in pgr",
      "createdAt": "2026-02-14T18:05:30.937Z",
      "updatedAt": "2026-02-14T18:05:30.937Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "4edd1b30-e534-46ea-88e4-60768c064e30",
      "time": "2026-02-14T12:08:56.917Z",
      "note": "I came back from the walk then instead of locking in I spend a lot of time in my mobile phone. It all started with a single youtube video, which was informative but I soon found myself checking instagram and scrolling reels. I have to go to boxing in about 45 mins but I have not achieved any substantial amount of work",
      "createdAt": "2026-02-14T12:08:56.917Z",
      "updatedAt": "2026-02-14T12:08:56.917Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "06493dcb-3e1a-4cdc-9a7f-29a35fb269c0",
      "time": "2026-02-14T09:43:56.421Z",
      "note": "I have worked 25mins and then when I took the break, I reached out to my phone and then saw my creation again and again. See likes and comments. My mind is currently over stimulated. Recurring thoughts of my creation. I am thinking to go out on a walk. Which I will",
      "createdAt": "2026-02-14T09:43:56.421Z",
      "updatedAt": "2026-02-14T09:43:56.421Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "fb6e55cb-a6d3-434e-a400-f2042934189f",
      "time": "2026-02-14T08:02:38.208Z",
      "note": "Starting my workbout. I have planned rest of my day",
      "createdAt": "2026-02-14T08:02:38.208Z",
      "updatedAt": "2026-02-14T08:02:38.208Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "82edbd1b-37e2-418d-9524-d0390461808f",
      "time": "2026-02-14T07:56:49.964Z",
      "note": "I have posted the reel. It is too stimulating for me and I can drain myself. I have kept my phone out of reach and took a break, boiled veggies for lunch and now I am back at the desk.",
      "createdAt": "2026-02-14T07:56:49.964Z",
      "updatedAt": "2026-02-14T07:56:49.964Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "6b960995-a334-49c7-a452-5f2874e12369",
      "time": "2026-02-14T05:15:09.943Z",
      "note": "I have made an video and audio now I have to post process",
      "createdAt": "2026-02-14T05:15:09.943Z",
      "updatedAt": "2026-02-14T05:15:09.943Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "27f09574-0b9c-4938-9298-1ffcf829ac7a",
      "time": "2026-02-14T05:00:27.328Z",
      "note": "now recording the reel",
      "createdAt": "2026-02-14T05:00:27.328Z",
      "updatedAt": "2026-02-14T05:00:27.328Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "330f5ccd-5af1-4419-a3d5-7c1c2c68b50e",
      "time": "2026-02-13T16:32:40.373Z",
      "note": "I can even checkin from here",
      "createdAt": "2026-02-13T16:32:40.373Z",
      "updatedAt": "2026-02-13T16:32:40.373Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "323006c7-dc09-433f-bf06-371d0e86c72f",
      "time": "2026-02-13T16:31:22.592Z",
      "note": "Going thru the repo understanding the codebase",
      "createdAt": "2026-02-13T16:31:22.592Z",
      "updatedAt": "2026-02-13T16:31:22.592Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "89034916-55d3-4b89-83d9-d7378328aa81",
      "time": "2026-02-13T11:33:17.853Z",
      "note": "scrolled ig",
      "createdAt": "2026-02-13T11:33:17.853Z",
      "updatedAt": "2026-02-13T11:33:17.853Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "9e2f1531-94a0-470b-b489-4eefddfeb358",
      "time": "2026-02-13T11:18:23.031Z",
      "note": "Done for Audition. Had a break ate pizza. Sourdough it's good I didn't order anything else then the small size, my stomach didn't like it but the taste was awesome. I will prefer sourdough without cheese",
      "createdAt": "2026-02-13T11:18:23.031Z",
      "updatedAt": "2026-02-13T11:18:23.031Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "75b7d527-99d5-4c30-bf66-b161c20e6502",
      "time": "2026-02-13T09:41:04.039Z",
      "note": "Still learning about adobe audition.",
      "createdAt": "2026-02-13T09:41:04.039Z",
      "updatedAt": "2026-02-13T09:41:04.039Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "cc9bba8a-c04b-4479-8cde-b2b4785f74b5",
      "time": "2026-02-13T08:40:50.533Z",
      "note": "I bought the RODE mic and currently learning post processing",
      "createdAt": "2026-02-13T08:40:50.533Z",
      "updatedAt": "2026-02-13T08:40:50.533Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "3476b3ab-58f0-4e05-b29a-266ae10408b1",
      "time": "2026-02-12T16:40:34.350Z",
      "note": "Working on the jenkins extension. Enjoying",
      "createdAt": "2026-02-12T16:40:34.350Z",
      "updatedAt": "2026-02-12T16:40:34.350Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "b150703b-ac06-414c-b957-5cb42ad0b60c",
      "time": "2026-02-12T15:39:28.627Z",
      "note": "I found mysel again scrolling instagram. My work was loading so I went to instagram. Could have done other things but did not do",
      "createdAt": "2026-02-12T15:39:28.627Z",
      "updatedAt": "2026-02-12T15:39:28.627Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "5778a58d-3d4d-40f8-ab07-1c2c97f7f5d8",
      "time": "2026-02-12T15:20:21.451Z",
      "note": "I just created a repo for my extension and renamed it, then scrolled in instagram. Getting back now",
      "createdAt": "2026-02-12T15:20:21.451Z",
      "updatedAt": "2026-02-12T15:20:21.451Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "f032d372-6e6a-4390-8b24-ddaa25293423",
      "time": "2026-02-12T14:48:57.250Z",
      "note": "Effectively did no work today, other then mic",
      "createdAt": "2026-02-12T14:48:57.250Z",
      "updatedAt": "2026-02-12T14:48:57.250Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "69a78dea-978e-4fcb-8a43-6153df3313fa",
      "time": "2026-02-12T14:48:35.586Z",
      "note": "went out came back had my dinner 1 banana 2 breads and 2 eggs. Now will try to work",
      "createdAt": "2026-02-12T14:48:35.586Z",
      "updatedAt": "2026-02-12T14:48:35.586Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "6c909183-e9ad-42d6-8f41-9c5fdd1052ed",
      "time": "2026-02-12T11:30:17.150Z",
      "note": "Now I am back at desk. I will now start the work",
      "createdAt": "2026-02-12T11:30:17.150Z",
      "updatedAt": "2026-02-12T11:30:17.150Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "e486a827-c187-4b80-ac71-58c74a95a086",
      "time": "2026-02-12T10:56:54.225Z",
      "note": "waching youtube, topic epstine files. Watching american politics",
      "createdAt": "2026-02-12T10:56:54.225Z",
      "updatedAt": "2026-02-12T10:56:54.225Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "72398851-f790-463c-af75-aa945f079aaf",
      "time": "2026-02-12T09:55:04.279Z",
      "note": "i searched about the mic. Have compleated the research. Now I am watching youtube.",
      "createdAt": "2026-02-12T09:55:04.279Z",
      "updatedAt": "2026-02-12T09:55:04.279Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "6660fe3d-0832-487d-b3c6-eb30134439e7",
      "time": "2026-02-12T08:54:36.093Z",
      "note": "Researching about the mic",
      "createdAt": "2026-02-12T08:54:36.093Z",
      "updatedAt": "2026-02-12T08:54:36.093Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "622e6952-5b4a-4de1-a250-bbf2e2c76ee1",
      "time": "2026-02-11T16:17:04.143Z",
      "note": "watched youtube",
      "createdAt": "2026-02-11T16:17:04.143Z",
      "updatedAt": "2026-02-11T16:17:04.143Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "1e3bc3d2-37ff-4e4c-825e-10f18b86dab3",
      "time": "2026-02-11T13:48:58.292Z",
      "note": "ftftydhgghft",
      "createdAt": "2026-02-11T13:48:58.292Z",
      "updatedAt": "2026-02-11T13:48:58.292Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "a337099f-f339-46e5-827a-7420643e0646",
      "time": "2026-02-11T12:36:52.337Z",
      "note": "jhbu",
      "createdAt": "2026-02-11T12:36:52.337Z",
      "updatedAt": "2026-02-11T12:36:52.337Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "be2c0522-1d08-449b-8222-b821b8045037",
      "time": "2026-02-11T12:25:57.840Z",
      "note": "I went to youtube, and watch youtube because I am blocked by Dan",
      "createdAt": "2026-02-11T12:25:57.840Z",
      "updatedAt": "2026-02-11T12:25:57.840Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "3fb1cc54-2c4d-4e9e-b1d0-8b23cb1f34cd",
      "time": "2026-02-11T11:25:34.108Z",
      "note": "https://na.artifactory.swg-devops.com/ui/native/iot-mas-manage-team-generic-local/Industry_Solutions/IS_FIXES/IS_MX8_HOTFIXES/Transportation-8.0.X/DevBuilds/8.0.5/\n\nAsk Dan for correct transportation links",
      "createdAt": "2026-02-11T11:25:34.108Z",
      "updatedAt": "2026-02-11T11:25:34.108Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "14ba0f05-ba29-4121-801c-0471a92666ab",
      "time": "2026-02-11T11:19:48.321Z",
      "note": "I vibe coded this extension and uploaded it to Git. Should not invest more time here now!",
      "createdAt": "2026-02-11T11:19:48.321Z",
      "updatedAt": "2026-02-11T11:19:48.321Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "e238df6d-b2a2-4cc5-bffe-dab6dc9fce31",
      "time": "2026-02-17T14:29:17.797Z",
      "note": "this is from laptop",
      "createdAt": "2026-02-17T14:29:17.797Z",
      "updatedAt": "2026-02-17T14:29:17.797Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "161263ec-fcd9-4ce8-9c2a-b495259a17c2",
      "time": "2026-02-17T14:30:24.255Z",
      "note": "lll",
      "createdAt": "2026-02-17T14:30:24.255Z",
      "updatedAt": "2026-02-17T14:30:24.255Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "37d9fad0-075c-4fcb-8706-43f97f5cb63d",
      "time": "2026-02-17T14:31:02.955Z",
      "note": "jjnj",
      "createdAt": "2026-02-17T14:31:02.955Z",
      "updatedAt": "2026-02-17T14:31:02.955Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "04323c79-7767-4a80-8222-ae07a40794f9",
      "time": "2026-02-17T14:38:40.695Z",
      "note": "gfdmdhm",
      "createdAt": "2026-02-17T14:38:40.695Z",
      "updatedAt": "2026-02-17T14:38:40.695Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "e33692f4-3540-478b-8c58-c5712e1334ae",
      "time": "2026-02-17T14:34:23.419Z",
      "note": "sync to phone",
      "createdAt": "2026-02-17T14:34:23.419Z",
      "updatedAt": "2026-02-17T14:34:23.419Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "f86cad6e-d099-4066-9be9-2e1c782a7aa0",
      "time": "2026-02-17T17:27:10.988Z",
      "note": "I have raised the PR for the SP epic. I should sleep now",
      "createdAt": "2026-02-17T17:27:10.988Z",
      "updatedAt": "2026-02-17T17:27:10.988Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "40b0d9c5-e967-48ac-a484-9ce810bad3d6",
      "time": "2026-02-17T19:41:19.276Z",
      "note": "sleeping now",
      "createdAt": "2026-02-17T19:41:19.276Z",
      "updatedAt": "2026-02-17T19:41:19.276Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "bf744833-985d-48a9-bcdf-f4b80f240aec",
      "time": "2026-02-17T19:27:25.476Z",
      "note": "still watching got",
      "createdAt": "2026-02-17T19:27:25.476Z",
      "updatedAt": "2026-02-17T19:27:25.476Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "333828a9-2f7e-47b9-ae70-334e2fbe67c6",
      "time": "2026-02-17T18:27:18.911Z",
      "note": "watching. GOT",
      "createdAt": "2026-02-17T18:27:18.911Z",
      "updatedAt": "2026-02-17T18:27:18.911Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "8fc1281e-196e-4ccc-a896-bbfe4f85c2d9",
      "time": "2026-02-18T06:57:11.772Z",
      "note": "Trying to setup the dev env for avation. Currently tried to figure out the .project file. Now I an trying to fix the classpath but in eclipse I am unable to find the option to fix it",
      "createdAt": "2026-02-18T06:57:11.772Z",
      "updatedAt": "2026-02-18T06:57:11.772Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "35af5735-f16a-46a4-8564-b67b39d95aed",
      "time": "2026-02-18T06:24:38.820Z",
      "note": "I did the monitoring task, had an orange and saw some youtube videos",
      "createdAt": "2026-02-18T06:24:38.820Z",
      "updatedAt": "2026-02-18T06:24:38.820Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "eaa9eb80-c014-4544-bd2d-27a9aa875b50",
      "time": "2026-02-18T05:42:35.249Z",
      "note": "Plugged into my laptop",
      "createdAt": "2026-02-18T05:42:35.249Z",
      "updatedAt": "2026-02-18T05:42:35.249Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "13423568-5478-4b34-9a65-c164fca9c7cb",
      "time": "2026-02-18T09:57:17.148Z",
      "note": "Editing",
      "createdAt": "2026-02-18T09:57:17.148Z",
      "updatedAt": "2026-02-18T09:57:17.148Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "3410f1e6-6511-4442-b262-0c650699e3e9",
      "time": "2026-02-18T12:38:35.197Z",
      "note": "Back at the table",
      "createdAt": "2026-02-18T12:38:35.197Z",
      "updatedAt": "2026-02-18T12:38:35.197Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "866338ae-79f3-4306-8659-50684b83594e",
      "time": "2026-02-18T10:44:47.614Z",
      "note": "Completed editing of Keys's wedding soundtrack and a conversation with Darshan and planned to join a football session with him",
      "createdAt": "2026-02-18T10:44:47.614Z",
      "updatedAt": "2026-02-18T10:44:47.614Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "a1bb8f83-d542-4acb-91ef-3108735a069b",
      "time": "2026-02-19T04:00:58.439Z",
      "note": "Woke up",
      "createdAt": "2026-02-19T04:00:58.439Z",
      "updatedAt": "2026-02-19T04:00:58.439Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "115a786f-4cd7-4de4-9370-14e77557e533",
      "time": "2026-02-18T20:56:43.467Z",
      "note": "Currently doing morse code audio transmissing, loving this, building creative things. I abs love doing this. It's late but I am in flow state",
      "createdAt": "2026-02-18T20:56:43.467Z",
      "updatedAt": "2026-02-18T20:56:43.467Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "5fa52926-c6d2-4b48-9ea8-d5437ffbef64",
      "time": "2026-02-18T17:54:54.123Z",
      "note": "Had a long conversation with Shashank. Then scrolled",
      "createdAt": "2026-02-18T17:54:54.123Z",
      "updatedAt": "2026-02-18T17:54:54.123Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "a7caffbb-8e78-4037-8ce4-c0839247b766",
      "time": "2026-02-19T07:11:02.956Z",
      "note": "Plugged in",
      "createdAt": "2026-02-19T07:11:02.956Z",
      "updatedAt": "2026-02-19T07:11:02.956Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "0258a376-f4ad-4d8a-b407-6aa5b91e6129",
      "time": "2026-02-20T08:45:11.865Z",
      "note": "Pludded in",
      "createdAt": "2026-02-20T08:45:11.865Z",
      "updatedAt": "2026-02-20T08:45:11.865Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "886ee299-2365-4dfa-ad4e-0886783ff705",
      "time": "2026-02-19T18:07:46.789Z",
      "note": "Env is up and running, Hell yeah",
      "createdAt": "2026-02-19T18:07:46.789Z",
      "updatedAt": "2026-02-19T18:07:46.789Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "99266577-bbdb-4e04-9a13-c876d31806bf",
      "time": "2026-02-19T16:00:58.693Z",
      "note": "Resolved weblogic and classpath for the avation",
      "createdAt": "2026-02-19T16:00:58.693Z",
      "updatedAt": "2026-02-19T16:00:58.693Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "d3fca3f3-486a-4ab8-9739-c847e0c40d4a",
      "time": "2026-02-19T13:40:55.205Z",
      "note": "Will solve this weblogic issue",
      "createdAt": "2026-02-19T13:40:55.205Z",
      "updatedAt": "2026-02-19T13:40:55.205Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "3dd4a623-2c45-4dd7-a7bd-94d2466f24e5",
      "time": "2026-02-19T11:58:27.020Z",
      "note": "Solving weblogic issue",
      "createdAt": "2026-02-19T11:58:27.020Z",
      "updatedAt": "2026-02-19T11:58:27.020Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "6a887cb1-694c-48a9-8b74-e0a030eb5ac0",
      "time": "2026-02-19T08:58:16.643Z",
      "note": "PKG is there in 1:04:00 of the recording with luis",
      "createdAt": "2026-02-19T08:58:16.643Z",
      "updatedAt": "2026-02-19T08:58:16.643Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "7b359096-2b8d-4ce4-9d18-c0ef5b0148fa",
      "time": "2026-02-19T08:42:57.772Z",
      "note": "Watched hotstar, ate lunch",
      "createdAt": "2026-02-19T08:42:57.772Z",
      "updatedAt": "2026-02-19T08:42:57.772Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "00416677-9bea-4dd5-b9fb-427bdf41dd98",
      "time": "2026-02-23T10:40:46.485Z",
      "note": "https://github.com/samarth-singh-thakur/hell-yeah-data-encoder-app",
      "createdAt": "2026-02-23T10:40:46.485Z",
      "updatedAt": "2026-02-23T10:40:46.485Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "10448c18-7eb6-4ab4-8e7e-a705c611dd68",
      "time": "2026-02-23T10:38:44.979Z",
      "note": "https://github.com/samarth-singh-thakur/hell-yeah-react-client",
      "createdAt": "2026-02-23T10:38:44.979Z",
      "updatedAt": "2026-02-23T10:38:44.979Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "4933e307-5dc6-4e4f-bb84-49c421f70bdf",
      "time": "2026-02-21T05:49:25.469Z",
      "note": "woke up at 9:45, did tatkal ticket for Aditi and washed sheets. Had some time with Ankit, goofing around as flatmates. Now working on the acoustic data transfer script",
      "createdAt": "2026-02-21T05:49:25.469Z",
      "updatedAt": "2026-02-21T05:49:25.469Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "756d45fd-fbc2-441a-baf9-be194562e29a",
      "time": "2026-02-20T20:47:03.784Z",
      "note": "f",
      "createdAt": "2026-02-20T20:47:03.784Z",
      "updatedAt": "2026-02-20T20:47:03.784Z",
      "version": 1,
      "deleted": false
    },
    {
      "id": "40c2299f-ec6c-4716-bfc0-44b28eb97964",
      "time": "2026-02-20T19:18:56.475Z",
      "note": "yo",
      "createdAt": "2026-02-20T19:18:56.475Z",
      "updatedAt": "2026-02-20T19:18:56.475Z",
      "version": 1,
      "deleted": false
    }
  ],
  "serverTime": "2026-03-11T19:37:03.311Z"
};
  
  // Convert main branch format (note, time) to v2.0 format (content, timestamp)
  const v2Entries = serverResponse.entries
    .filter(e => !e.deleted);
  
  console.log('📦 Importing', v2Entries.length, 'entries in new format');
  
  // Save to Chrome storage with new format
  chrome.storage.local.set({ 'standupnow_entries': v2Entries }, function() {
    if (chrome.runtime.lastError) {
      console.error('❌ Error saving to Chrome storage:', chrome.runtime.lastError);
    } else {
      console.log('✅ Successfully saved', v2Entries.length, 'entries to Chrome storage');
      console.log('🔄 Reloading extension...');
      
      // Reload the page to show new entries
      setTimeout(() => location.reload(), 500);
    }
  });
})();
import SidebarMenu from "@/common/SidebarMenu/SidebarMenu";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { BsFillGrid3X3GapFill } from "react-icons/bs";
import { MdEditSquare } from "react-icons/md";
import { GetNotes } from "@/utils/notesApiCalling";
import { useDispatch, useSelector } from "react-redux";
import { allNotes } from "@/features/notes/notesSlice";
import { RiEdit2Fill } from "react-icons/ri";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { FaRobot } from "react-icons/fa";
import DeleteNotes from "@/components/DeleteNotes/DeleteNotes";
import NotesView from "@/components/NotesView/NotesView";
import { GetUserData } from "@/utils/userApiCall";
import { IoMdLock } from "react-icons/io";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotesThemeColors from "@/components/NotesThemeColors/NotesThemeColors";
import { IoMdArrowDropdown } from "react-icons/io";
import Loading from "@/components/Loading/Loading";
import axios from "axios";
import { apiRoutes } from "@/utils/apiRoutes";

const UserNotes = () => {
  // --------------- State Start ------------------
  const [data, setData] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [deleteBtn, setDeleteBtn] = useState(false);
  const [notesId, setNotesId] = useState(null);
  const [gridBtn, setGridBtn] = useState(false);
  const [userDetails, setUserDetails] = useState([]);
  const [themeColorBtn, setThemeColorBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [currentNoteContent, setCurrentNoteContent] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const notes = useSelector((state) => state.notes.value);

  // ------------------ State End -----------------
  const dispatch = useDispatch();
  const NotesData = async () => {
    setLoading(true);
    setData(await GetNotes());
    setLoading(false);
    dispatch(allNotes(await GetNotes()));
  };

  // --------------------- Search Input ---------------------
  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
    let newData = [];
    newData = notes.filter((item) => {
      return (
        !(
          item.title.toLowerCase().indexOf(e.target.value.toLowerCase()) === -1
        ) ||
        !(item.text.toLowerCase().indexOf(e.target.value.toLowerCase()) === -1)
      );
    });
    setData(newData);
  };

  // ------------------- Delete Button -------------------------
  const handleDeleteBtn = async (id) => {
    setDeleteBtn(!deleteBtn);
    setNotesId(id);
    setData(await GetNotes());
  };

  // ---------------------- Theme Colors Button ----------------
  const handleThemeColor = (response) => {
    setThemeColorBtn(!themeColorBtn);
    if (response._id) {
      setUserDetails(response);
    }
  };

  // ---------------- Theme Color Back Button ---------------
  const handleThemeBackBtn = () => {
    setThemeColorBtn(!themeColorBtn);
  };
  
  // -------------------- Sort Button -------------------
  const handleSortingBtn = (sortValue) => {
    if (sortValue === "time_ascending") {
      setData([...notes]);
    } else if (sortValue === "time_descending") {
      let rev = [...notes];
      let rev_temp = rev.reverse();
      setData(rev_temp);
    } else if (sortValue === "a-z") {
      let sortNotes = [...notes];
      let a_zSort = sortNotes.sort((item1, item2) => {
        let first = item1.title.toLowerCase();
        let second = item2.title.toLowerCase();
        return first > second ? 1 : -1;
      });
      setData(a_zSort);
    } else if (sortValue === "z-a") {
      let sortNotes = [...notes];
      let z_aSort = sortNotes.sort((item1, item2) => {
        let first = item1.title.toLowerCase();
        let second = item2.title.toLowerCase();
        return first > second ? -1 : 1;
      });
      setData(z_aSort);
    }
  };

  // ------------------- Grid Button --------------
  const handleGridBtn = async (response) => {
    setGridBtn(!gridBtn);
    if (response._id) {
      setUserDetails(response);
    }
  };

  // ------------------- AI Summarizer -------------------------
  const handleAISummarizer = async (noteContent) => {
    const token = localStorage.getItem("notebookToken");
    console.log("Entered summarizer:",noteContent);
    setCurrentNoteContent(noteContent);
    const response = await axios.post(apiRoutes.summarizeURI, {noteContent},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(response.data.data.analysis);
    // Basic summarization logic
    const sentences = noteContent.split('.');
    const summary = sentences.slice(0, 2).join('.') + (sentences.length > 2 ? '...' : '');
    console.log("Exiting summarizer");
    setAiSummary(response.data.data.analysis);
    setShowAISummary(true);
  };

  const closeAISummary = () => {
    setShowAISummary(false);
  };

  const handleApiCalling = async () => {
    setLoading(true);
    let userData = await GetUserData();
    setLoading(false);
    setUserDetails(userData);
  };

  // ---------------------- useEffect -----------------------------
  useEffect(() => {
    handleApiCalling();
    NotesData();
  }, []);

  return (
    <>
      {loading ? <Loading /> : ""}
      <div className="w-full flex flex-col box-border">
        <div className="w-full h-screen pt-10 flex">
          <SidebarMenu />
          <div className="w-full flex flex-col background_color overflow-auto text-sm md:text-base">
            <div className="w-full flex justify-between p-4 md:p-5">
              {/* Create Notes Button */}
              <div>
                <NavLink
                  to="/user/create_notes"
                  className={`bg-green-700 hover:bg-green-900 text-white py-3 md:py-2 px-3 rounded flex items-center gap-x-1`}
                >
                  <MdEditSquare />
                  <span className="hidden md:inline-block">Create</span>
                </NavLink>
              </div>
              
              {/* Search Notes */}
              <div className="">
                <div className="w-full">
                  <label
                    htmlFor="search"
                    className="border border-green-700 rounded flex items-center pr-2 py-1 bg-green-50"
                  >
                    <input
                      type="text"
                      placeholder="Search your notes"
                      id="search"
                      value={searchInput}
                      onChange={handleSearchInput}
                      className="py-1 px-2 outline-none bg-green-50"
                    />
                    <CiSearch />
                  </label>
                </div>
              </div>
              
              {/* View Option */}
              <div>
                <button
                  onClick={handleGridBtn}
                  className="py-2.5 md:py-2 px-3 border border-green-700 flex items-center gap-x-2 text-green-700 rounded hover:bg-green-700 hover:text-white"
                >
                  <span className="hidden md:inline-block">View</span>
                  <BsFillGrid3X3GapFill />
                </button>
              </div>
            </div>

            {/* Colors, Sorting and Notes Count */}
            <div className="w-full flex justify-between px-4 md:px-5 bg-gray-300 py-1 md:py-2">
              <button
                onClick={handleThemeColor}
                className={`py-1 md:py-2 px-4 md:px-5 borders border-black rounded shadow-sm shadow-gray-500 ${
                  userDetails.themeColor || "bg-green-100"
                }`}
              ></button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`px-2 py-1 text-green-900 outline-none flex gap-x-1 items-center rounded hover:bg-green-700 hover:text-white`}
                >
                  Sorting notes <IoMdArrowDropdown />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleSortingBtn("time_ascending")}
                  >
                    Sort time by ascending order
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSortingBtn("time_descending")}
                  >
                    Sort time by descending order
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortingBtn("a-z")}>
                    Sort alphabetical (A to Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortingBtn("z-a")}>
                    Sort alphabetical (Z to A)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="text-green-800 flex items-center">
                {data.length} Notes
              </div>
            </div>

            {/* All Notes */}
            {loading ? (
              <Loading />
            ) : data.length === 0 ? (
              <div className="flex justify-center items-center w-full mt-10">
                <div className="flex flex-col items-center">
                  No notes found
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div
                  className={`w-full grid ${
                    userDetails.gridView === "list"
                      ? "grid-cols-1"
                      : userDetails.gridView === "grid"
                      ? "grid-cols-3"
                      : "grid-cols-2"
                  } gap-2 p-4`}
                >
                  {data.map((item, index) => (
                    <div
                      className={`w-full p-5 rounded-lg ${
                        userDetails.themeColor || "bg-green-100"
                      } shadow-xls shadow-lg`}
                      key={index}
                    >
                      <h1 className="text-base md:text-2xl font-bold truncate text-green-700">
                        {item.isPasswordProtected ? (
                          <span className="flex gap-x-1 text-gray-500 font-bold items-center text-sm md:text-2xl">
                            <IoMdLock className="self-center" />
                            Locked
                          </span>
                        ) : (
                          item.title
                        )}
                      </h1>
                      <p className="truncate text-green-700 text-sm md:text-base">
                        {item.isPasswordProtected ? (
                          <span className="flex gap-x-0.5 items-center">
                            <IoMdLock />
                            This notes is protected
                          </span>
                        ) : (
                          item.text
                        )}
                      </p>

                      <div className="w-full flex justify-between mt-2">
                        <NavLink
                          to={`/user/update_notes/${item._id}`}
                          className="flex items-center gap-x-1 text-gray-600 border border-gray-500 shadow-gray-300 shadow-md px-1.5 py-1 md:py-0.5 rounded hover:bg-gray-500 hover:text-white"
                        >
                          <RiEdit2Fill />
                          <span className="hidden md:inline-block">Edit</span>
                        </NavLink>
                        
                        <button
                          onClick={() => handleAISummarizer(item.text)}
                          className="flex items-center gap-x-1 text-blue-500 border border-blue-500 shadow-gray-300 shadow-md px-1.5 py-1 md:py-0.5 rounded hover:bg-blue-500 hover:text-white"
                        >
                          <FaRobot />
                          <span className="hidden md:inline-block">AI Summary</span>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteBtn(item._id)}
                          className="flex items-center gap-x-1 text-red-400 border shadow-gray-300 shadow-md border-red-400 px-1.5 py-1 md:py-0.5 rounded hover:bg-red-400 hover:text-white"
                        >
                          <RiDeleteBin5Fill />
                          <span className="hidden md:inline-block">Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Summary Modal */}
      {showAISummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-600">
                <FaRobot className="inline mr-2" />
                AI Summary
              </h3>
              <button 
                onClick={closeAISummary}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Original Text:</h4>
              <p className="text-gray-700 mb-4 bg-gray-100 p-2 rounded">
                {currentNoteContent}
              </p>
              
              <h4 className="font-semibold mb-2">Summary:</h4>
              <p className="text-gray-800 bg-blue-50 p-3 rounded">
                {aiSummary || "Generating summary..."}
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={closeAISummary}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Notes Modal */}
      {deleteBtn ? (
        <DeleteNotes handleDeleteBtn={handleDeleteBtn} notesId={notesId} />
      ) : (
        ""
      )}

      {/* Notes View Modal */}
      {gridBtn ? <NotesView handleGridBtn={handleGridBtn} /> : ""}

      {/* Notes Theme Colors Modal */}
      {themeColorBtn ? (
        <NotesThemeColors
          handleThemeColor={handleThemeColor}
          handleThemeBackBtn={handleThemeBackBtn}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default UserNotes;